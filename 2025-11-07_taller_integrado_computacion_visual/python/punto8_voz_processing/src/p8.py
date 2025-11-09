"""
Sistema de Reconocimiento de Voz y Control por Comandos
Soporta reconocimiento local (Sphinx) y online (Google)
Envía comandos vía OSC a Unity/Processing
Retroalimentación por voz con pyttsx3

Instalación requerida:
pip install SpeechRecognition pyaudio pyttsx3 python-osc pocketsphinx
"""

import speech_recognition as sr
import pyttsx3
import threading
import time
from pythonosc import udp_client
from pythonosc.dispatcher import Dispatcher
from pythonosc.osc_server import BlockingOSCUDPServer
from typing import Callable, Dict, List
import queue

class VoiceCommandSystem:
    """Sistema principal de reconocimiento y control por voz"""
    
    def __init__(self, 
                 recognition_mode='online',  # 'online' o 'sphinx'
                 osc_ip='127.0.0.1',
                 osc_send_port=8000,
                 osc_receive_port=8001):
        """
        Args:
            recognition_mode: 'online' (Google) o 'sphinx' (local CMU Sphinx)
            osc_ip: IP para enviar mensajes OSC
            osc_send_port: Puerto para enviar comandos
            osc_receive_port: Puerto para recibir respuestas
        """
        # Inicializar reconocedor de voz
        self.recognizer = sr.Recognizer()
        self.microphone = sr.Microphone()
        self.recognition_mode = recognition_mode
        
        # Configurar reconocedor
        self.recognizer.energy_threshold = 4000
        self.recognizer.dynamic_energy_threshold = True
        self.recognizer.pause_threshold = 0.8
        
        # Inicializar motor de voz
        self.tts_engine = pyttsx3.init()
        self.tts_engine.setProperty('rate', 175)
        self.tts_engine.setProperty('volume', 0.9)
        
        # Cliente OSC para enviar comandos
        self.osc_client = udp_client.SimpleUDPClient(osc_ip, osc_send_port)
        
        # Servidor OSC para recibir respuestas
        self.osc_dispatcher = Dispatcher()
        self.osc_server = BlockingOSCUDPServer(
            (osc_ip, osc_receive_port), 
            self.osc_dispatcher
        )
        
        # Diccionario de comandos
        self.commands: Dict[str, Callable] = {}
        self.command_aliases: Dict[str, str] = {}
        
        # Control de estado
        self.is_listening = False
        self.is_running = False
        self.listen_thread = None
        self.osc_thread = None
        
        # Cola de respuestas de voz
        self.speech_queue = queue.Queue()
        self.speech_thread = None
        
        # Configurar comandos básicos
        self._setup_basic_commands()
        
        # Ajustar micrófono al ruido ambiente
        print("Ajustando al ruido ambiente...")
        with self.microphone as source:
            self.recognizer.adjust_for_ambient_noise(source, duration=1)
        print("¡Listo para escuchar!")

    def _setup_basic_commands(self):
        """Configurar comandos básicos del sistema"""
        self.register_command("detener", self.stop_listening, 
                            ["parar", "alto", "stop"])
        self.register_command("ayuda", self.show_help, 
                            ["help", "comandos"])

    def register_command(self, 
                        command: str, 
                        callback: Callable, 
                        aliases: List[str] = None,
                        osc_address: str = None):
        """
        Registrar un nuevo comando de voz
        
        Args:
            command: Palabra clave del comando
            callback: Función a ejecutar
            aliases: Lista de palabras alternativas
            osc_address: Dirección OSC para enviar (opcional)
        """
        command_lower = command.lower()
        self.commands[command_lower] = {
            'callback': callback,
            'osc_address': osc_address
        }
        
        if aliases:
            for alias in aliases:
                self.command_aliases[alias.lower()] = command_lower
        
        print(f"✓ Comando registrado: '{command}'" + 
              (f" (aliases: {', '.join(aliases)})" if aliases else ""))

    def speak(self, text: str, async_mode: bool = True):
        """
        Sintetizar voz
        
        Args:
            text: Texto a hablar
            async_mode: Si es True, habla en segundo plano
        """
        if async_mode:
            self.speech_queue.put(text)
        else:
            self.tts_engine.say(text)
            self.tts_engine.runAndWait()

    def _speech_worker(self):
        """Worker para hablar en segundo plano"""
        while self.is_running:
            try:
                text = self.speech_queue.get(timeout=0.5)
                self.tts_engine.say(text)
                self.tts_engine.runAndWait()
            except queue.Empty:
                continue

    def send_osc(self, address: str, *args):
        """Enviar mensaje OSC"""
        try:
            self.osc_client.send_message(address, args)
            print(f"OSC → {address}: {args}")
        except Exception as e:
            print(f"Error enviando OSC: {e}")

    def _recognize_speech(self, audio) -> str:
        """
        Reconocer audio usando el método configurado
        
        Returns:
            Texto reconocido o None
        """
        try:
            if self.recognition_mode == 'sphinx':
                # Reconocimiento local con CMU Sphinx
                text = self.recognizer.recognize_sphinx(audio, language='es-ES')
            else:
                # Reconocimiento online con Google
                text = self.recognizer.recognize_google(audio, language='es-ES')
            
            return text.lower()
            
        except sr.UnknownValueError:
            return None
        except sr.RequestError as e:
            print(f"Error en el servicio de reconocimiento: {e}")
            return None

    def _process_command(self, text: str):
        """Procesar texto reconocido y ejecutar comandos"""
        if not text:
            return
        
        print(f"Escuchado: '{text}'")
        
        # Buscar comando en el texto
        command_found = False
        
        for word in text.split():
            # Buscar comando directo
            if word in self.commands:
                command_found = True
                self._execute_command(word, text)
                break
            
            # Buscar alias
            if word in self.command_aliases:
                command_found = True
                actual_command = self.command_aliases[word]
                self._execute_command(actual_command, text)
                break
        
        if not command_found:
            # Enviar todo el texto como comando genérico
            self.send_osc("/voice/text", text)
            self.speak("Comando no reconocido")

    def _execute_command(self, command: str, full_text: str):
        """Ejecutar un comando específico"""
        command_data = self.commands[command]
        
        # Ejecutar callback
        try:
            command_data['callback'](full_text)
        except Exception as e:
            print(f"Error ejecutando comando '{command}': {e}")
            self.speak("Error al ejecutar comando")
            return
        
        # Enviar por OSC si está configurado
        if command_data['osc_address']:
            self.send_osc(command_data['osc_address'], full_text)

    def _listen_worker(self):
        """Worker para escuchar continuamente"""
        print("🎤 Escuchando comandos de voz...")
        
        with self.microphone as source:
            while self.is_listening:
                try:
                    # Escuchar audio
                    audio = self.recognizer.listen(source, timeout=1, phrase_time_limit=5)
                    
                    # Reconocer en un thread separado para no bloquear
                    text = self._recognize_speech(audio)
                    
                    if text:
                        self._process_command(text)
                    
                except sr.WaitTimeoutError:
                    continue
                except Exception as e:
                    print(f"Error en escucha: {e}")
                    time.sleep(0.5)

    def start_listening(self):
        """Iniciar escucha continua de comandos"""
        if self.is_listening:
            print("Ya está escuchando")
            return
        
        self.is_listening = True
        self.is_running = True
        
        # Iniciar thread de escucha
        self.listen_thread = threading.Thread(target=self._listen_worker)
        self.listen_thread.daemon = True
        self.listen_thread.start()
        
        # Iniciar thread de voz
        self.speech_thread = threading.Thread(target=self._speech_worker)
        self.speech_thread.daemon = True
        self.speech_thread.start()
        
        # Iniciar servidor OSC
        self.osc_thread = threading.Thread(target=self.osc_server.serve_forever)
        self.osc_thread.daemon = True
        self.osc_thread.start()
        
        self.speak("Sistema de voz activado")

    def stop_listening(self, *args):
        """Detener escucha de comandos"""
        print("Deteniendo sistema de voz...")
        self.is_listening = False
        self.speak("Sistema de voz desactivado")

    def shutdown(self):
        """Apagar completamente el sistema"""
        self.is_listening = False
        self.is_running = False
        
        if self.osc_server:
            self.osc_server.shutdown()
        
        print("Sistema apagado")

    def show_help(self, *args):
        """Mostrar comandos disponibles"""
        print("\n=== COMANDOS DISPONIBLES ===")
        for cmd, data in self.commands.items():
            aliases = [k for k, v in self.command_aliases.items() if v == cmd]
            alias_str = f" (aliases: {', '.join(aliases)})" if aliases else ""
            print(f"  • {cmd}{alias_str}")
        print("============================\n")
        
        self.speak("Mostrando lista de comandos")


# ============================================================================
# EJEMPLO DE USO CON COMANDOS PERSONALIZADOS
# ============================================================================

class VisualControlSystem(VoiceCommandSystem):
    """Sistema extendido con comandos para control visual"""
    
    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        self._setup_visual_commands()
    
    def _setup_visual_commands(self):
        """Configurar comandos para control visual"""
        
        # Comandos de color
        self.register_command("rojo", self.change_color,
                            ["red"], "/visual/color")
        self.register_command("azul", self.change_color,
                            ["blue"], "/visual/color")
        self.register_command("verde", self.change_color,
                            ["green"], "/visual/color")
        
        # Comandos de forma
        self.register_command("círculo", self.change_shape,
                            ["circulo", "circle"], "/visual/shape")
        self.register_command("cuadrado", self.change_shape,
                            ["square"], "/visual/shape")
        self.register_command("triángulo", self.change_shape,
                            ["triangulo", "triangle"], "/visual/shape")
        
        # Comandos de animación
        self.register_command("rotar", self.animate,
                            ["rotate", "girar"], "/visual/rotate")
        self.register_command("crecer", self.animate,
                            ["grow", "grande"], "/visual/scale")
        self.register_command("mover", self.animate,
                            ["move"], "/visual/move")
        
        # Comandos de escena
        self.register_command("limpiar", self.clear_scene,
                            ["clear", "borrar"], "/scene/clear")
        self.register_command("guardar", self.save_scene,
                            ["save"], "/scene/save")
        self.register_command("cargar", self.load_scene,
                            ["load"], "/scene/load")
        
        # Comandos de efectos
        self.register_command("partículas", self.add_particles,
                            ["particles", "particulas"], "/effects/particles")
        self.register_command("explosión", self.explosion_effect,
                            ["explosion"], "/effects/explosion")

    def change_color(self, text: str):
        """Cambiar color del objeto"""
        colors = {
            'rojo': (1.0, 0.0, 0.0),
            'azul': (0.0, 0.0, 1.0),
            'verde': (0.0, 1.0, 0.0),
            'amarillo': (1.0, 1.0, 0.0),
            'naranja': (1.0, 0.5, 0.0)
        }
        
        for color_name, rgb in colors.items():
            if color_name in text:
                self.send_osc("/visual/color", *rgb)
                self.speak(f"Color cambiado a {color_name}")
                return
    
    def change_shape(self, text: str):
        """Cambiar forma del objeto"""
        shapes = ['círculo', 'circulo', 'cuadrado', 'triángulo', 'triangulo']
        
        for shape in shapes:
            if shape in text:
                self.send_osc("/visual/shape", shape)
                self.speak(f"Forma cambiada a {shape}")
                return
    
    def animate(self, text: str):
        """Aplicar animación"""
        if 'rotar' in text or 'rotate' in text:
            self.send_osc("/visual/rotate", True)
            self.speak("Rotando objeto")
        elif 'crecer' in text or 'grow' in text:
            self.send_osc("/visual/scale", 2.0)
            self.speak("Aumentando tamaño")
        elif 'mover' in text or 'move' in text:
            self.send_osc("/visual/move", True)
            self.speak("Moviendo objeto")
    
    def clear_scene(self, text: str):
        """Limpiar escena"""
        self.send_osc("/scene/clear")
        self.speak("Escena limpiada")
    
    def save_scene(self, text: str):
        """Guardar escena"""
        self.send_osc("/scene/save")
        self.speak("Escena guardada")
    
    def load_scene(self, text: str):
        """Cargar escena"""
        self.send_osc("/scene/load")
        self.speak("Cargando escena")
    
    def add_particles(self, text: str):
        """Agregar sistema de partículas"""
        self.send_osc("/effects/particles", True)
        self.speak("Agregando partículas")
    
    def explosion_effect(self, text: str):
        """Efecto de explosión"""
        self.send_osc("/effects/explosion")
        self.speak("¡Explosión!")


# ============================================================================
# PROGRAMA PRINCIPAL
# ============================================================================

if __name__ == "__main__":
    print("=" * 60)
    print("SISTEMA DE RECONOCIMIENTO DE VOZ Y CONTROL POR COMANDOS")
    print("=" * 60)
    print()
    
    # Crear sistema con reconocimiento online (Google)
    # Para usar Sphinx local, cambiar a recognition_mode='sphinx'
    system = VisualControlSystem(
        recognition_mode='online',  # 'online' o 'sphinx'
        osc_ip='127.0.0.1',
        osc_send_port=8000,
        osc_receive_port=8001
    )
    
    # Agregar comandos personalizados adicionales
    def custom_command(text):
        print(f"Comando personalizado ejecutado: {text}")
        system.speak("Comando personalizado recibido")
    
    system.register_command("test", custom_command, 
                          ["prueba"], "/custom/test")
    
    # Mostrar ayuda
    system.show_help()
    
    # Iniciar sistema
    system.start_listening()
    
    print("\n📢 INSTRUCCIONES:")
    print("  • Habla claramente hacia el micrófono")
    print("  • Di 'ayuda' para ver todos los comandos")
    print("  • Di 'detener' para apagar el sistema")
    print("  • Presiona Ctrl+C para salir")
    print()
    
    try:
        # Mantener programa en ejecución
        while system.is_listening:
            time.sleep(0.1)
    except KeyboardInterrupt:
        print("\n\nInterrumpido por usuario")
    finally:
        system.shutdown()
        print("¡Hasta luego!")