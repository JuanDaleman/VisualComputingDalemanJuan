"""
Rock-Paper-Scissors hand-gesture minigame using MediaPipe + OpenCV
Features:
- Real-time hand detection with MediaPipe Hands
- Finger counting and distance measurements
- Gesture recognition: 'rock', 'paper', 'scissors', 'none'
- Mapping gestures to visual actions
- Minigame: play Rock-Paper-Scissors against the computer

Usage:
- Install dependencies: pip install mediapipe opencv-python numpy
- Run: python rps_hand_gesture_minigame.py
- Controls: 'q' to quit, 'r' to reset/next round

Notes:
- Works best with a single hand visible to the camera.
- Hold the gesture steady for a short moment to register.
"""

import cv2
import mediapipe as mp
import numpy as np
import random
import time

# ------- Configuration -------
CAMERA_INDEX = 0
DETECTION_CONFIDENCE = 0.7
TRACKING_CONFIDENCE = 0.7
HOLD_FRAMES_REQUIRED = 8  # number of frames gesture must be stable
RESULT_DISPLAY_TIME = 2.0  # seconds to show result

# ------- MediaPipe setup -------
mp_hands = mp.solutions.hands
mp_drawing = mp.solutions.drawing_utils
mp_drawing_styles = mp.solutions.drawing_styles

# Utility: finger indices for landmarks
FINGER_TIPS = [4, 8, 12, 16, 20]
FINGER_PIPS = [3, 6, 10, 14, 18]  # approximate PIP joints

# Game choices
CHOICES = ['rock', 'paper', 'scissors']

# Simple helper functions

def distance(a, b):
    return np.linalg.norm(np.array(a) - np.array(b))


def landmark_to_point(landmark, w, h):
    return int(landmark.x * w), int(landmark.y * h)


# Finger counting heuristic (works for most frontal camera views)
# Returns list of booleans: True if finger is up
def fingers_up(hand_landmarks, img_w, img_h, handedness_label):
    lm = hand_landmarks.landmark
    fingers = []
        # Thumb detection based on handedness
    # For RIGHT hand: thumb tip x < thumb ip x means open
    # For LEFT hand: inverse
    if handedness_label == 'Right':
        fingers.append(lm[FINGER_TIPS[0]].x < lm[FINGER_PIPS[0]].x)
    else:  # Left hand
        fingers.append(lm[FINGER_TIPS[0]].x > lm[FINGER_PIPS[0]].x)

    # Other fingers: tip higher (y smaller) than PIP => extended
    for tip, pip in zip(FINGER_TIPS[1:], FINGER_PIPS[1:]):
        fingers.append(lm[tip].y < lm[pip].y)

    return fingers


# Gesture recognition from fingers pattern
# rock => all fingers down
# paper => all fingers up
# scissors => index and middle up, others down
# returns 'rock'|'paper'|'scissors'|'none'
def recognize_gesture(fingers):
    # fingers is [thumb, index, middle, ring, pinky]
    if fingers is None:
        return 'none'
    up_count = sum(fingers)
    if up_count == 0:
        return 'rock'
    if up_count == 5:
        return 'paper'
    # scissors: index and middle true, ring and pinky false (thumb can be either)
    if fingers[1] and fingers[2] and not fingers[3] and not fingers[4]:
        return 'scissors'
    return 'none'


# Determine winner
# returns 'win'|'lose'|'tie'
def rps_result(player, pc):
    if player == pc:
        return 'tie'
    wins = {
        'rock': 'scissors',
        'paper': 'rock',
        'scissors': 'paper'
    }
    if wins[player] == pc:
        return 'win'
    else:
        return 'lose'


# Draw stylized text box
def draw_centered_text(img, text, pos, scale=1.0, thickness=2):
    (w, h), _ = cv2.getTextSize(text, cv2.FONT_HERSHEY_SIMPLEX, scale, thickness)
    x, y = pos
    cv2.rectangle(img, (x - w - 20, y - h - 20), (x + 20, y + 20), (0, 0, 0), -1)
    cv2.putText(img, text, (x - w // 2, y + h // 2), cv2.FONT_HERSHEY_SIMPLEX, scale, (255, 255, 255), thickness, cv2.LINE_AA)


# Main application loop

def main():
    cap = cv2.VideoCapture(CAMERA_INDEX)
    if not cap.isOpened():
        print('Error: Could not open camera.')
        return

    with mp_hands.Hands(max_num_hands=1,
                        min_detection_confidence=DETECTION_CONFIDENCE,
                        min_tracking_confidence=TRACKING_CONFIDENCE) as hands:

        state = 'idle'  # idle, detecting, locked, result
        stable_gesture = None
        stable_frames = 0
        player_choice = 'none'
        pc_choice = 'none'
        result = None
        result_time = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                break

            h, w, _ = frame.shape
            # Flip for mirror view
            frame = cv2.flip(frame, 1)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            rgb.flags.writeable = False
            res = hands.process(rgb)
            rgb.flags.writeable = True

            # draw background HUD
            cv2.rectangle(frame, (0, 0), (w, 80), (20, 20, 20), -1)
            cv2.putText(frame, 'Make a gesture: rock / paper / scissors', (10, 30),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 2)
            cv2.putText(frame, "Press 'r' to reset round, 'q' to quit", (10, 58),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.5, (160, 160, 160), 1)

            gesture = 'none'
            fingers = None

            if res.multi_hand_landmarks:
                hand_landmarks = res.multi_hand_landmarks[0]
                # draw landmarks
                mp_drawing.draw_landmarks(
                    frame,
                    hand_landmarks,
                    mp_hands.HAND_CONNECTIONS,
                    mp_drawing_styles.get_default_hand_landmarks_style(),
                    mp_drawing_styles.get_default_hand_connections_style())

                # compute fingers
                hand_label = res.multi_handedness[0].classification[0].label
                fingers = fingers_up(hand_landmarks, w, h, hand_label)
                gesture = recognize_gesture(fingers)

                # show finger state
                for i, val in enumerate(fingers):
                    txt = '1' if val else '0'
                    lx, ly = landmark_to_point(hand_landmarks.landmark[FINGER_TIPS[i]], w, h)
                    cv2.putText(frame, txt, (lx - 10, ly - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0) if val else (0, 0, 255), 2)

                # distances demo: distance between thumb tip and index tip
                thumb_pt = landmark_to_point(hand_landmarks.landmark[4], w, h)
                index_pt = landmark_to_point(hand_landmarks.landmark[8], w, h)
                d = int(distance(thumb_pt, index_pt))
                cv2.line(frame, thumb_pt, index_pt, (255, 255, 0), 2)
                cv2.putText(frame, f'D={d}px', (index_pt[0] + 10, index_pt[1] - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 0), 2)

            # State machine for gesture stability and game logic
            if state in ['idle', 'detecting']:
                if gesture != 'none':
                    if gesture == stable_gesture:
                        stable_frames += 1
                    else:
                        stable_gesture = gesture
                        stable_frames = 1

                    # show detecting progress bar
                    cv2.putText(frame, f'Detecting: {gesture} ({stable_frames}/{HOLD_FRAMES_REQUIRED})', (10, h - 50), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (220, 220, 220), 2)

                    if stable_frames >= HOLD_FRAMES_REQUIRED:
                        # lock gesture
                        player_choice = stable_gesture
                        pc_choice = random.choice(CHOICES)
                        result = rps_result(player_choice, pc_choice)
                        result_time = time.time()
                        state = 'result'
                else:
                    stable_gesture = None
                    stable_frames = 0

            # Show current locked choices if in result
            if state == 'result':
                # draw choices large on screen
                draw_centered_text(frame, f'You: {player_choice}', (w // 4, h // 2), scale=1.0, thickness=2)
                draw_centered_text(frame, f'PC: {pc_choice}', (3 * w // 4, h // 2), scale=1.0, thickness=2)

                # show result
                if result == 'win':
                    draw_centered_text(frame, 'YOU WIN!', (w // 2, int(h * 0.15)), scale=1.4, thickness=3)
                elif result == 'lose':
                    draw_centered_text(frame, 'YOU LOSE', (w // 2, int(h * 0.15)), scale=1.4, thickness=3)
                else:
                    draw_centered_text(frame, "IT'S A TIE", (w // 2, int(h * 0.15)), scale=1.4, thickness=3)

                if time.time() - result_time > RESULT_DISPLAY_TIME:
                    # move to next round
                    state = 'idle'
                    stable_gesture = None
                    stable_frames = 0
                    player_choice = 'none'
                    pc_choice = 'none'
                    result = None

            # small status overlay in corner
            cv2.putText(frame, f'State: {state}', (w - 220, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)
            cv2.putText(frame, f'Gesture: {gesture}', (w - 220, 58), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 2)

            cv2.imshow('RPS Hand Gesture Minigame', frame)

            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            if key == ord('r'):
                # reset immediately
                state = 'idle'
                stable_gesture = None
                stable_frames = 0
                player_choice = 'none'
                pc_choice = 'none'
                result = None

    cap.release()
    cv2.destroyAllWindows()


if __name__ == '__main__':
    main()
