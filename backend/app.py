from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

import cv2
import numpy as np

import os
import time
import base64


# =========================================================
# Flask Application Setup
# =========================================================

app = Flask(__name__)
CORS(app)


# =========================================================
# Helper: Convert OpenCV Image to Base64
# =========================================================

def image_to_base64(image):
    """
    Convert an OpenCV image into a Base64 JPEG string
    so that it can be displayed by the frontend.
    """

    success, buffer = cv2.imencode(".jpg", image)

    if not success:
        raise ValueError("Could not encode result image.")

    encoded_image = base64.b64encode(
        buffer
    ).decode("utf-8")

    return encoded_image


# =========================================================
# ORB Feature Matching
# =========================================================

def run_orb(image1, image2):

    start_time = time.time()

    # Create ORB detector
    orb = cv2.ORB_create(nfeatures=1000)

    # Detect keypoints and compute descriptors
    keypoints1, descriptors1 = orb.detectAndCompute(
        image1, None
    )

    keypoints2, descriptors2 = orb.detectAndCompute(
        image2, None
    )

    if descriptors1 is None or descriptors2 is None:
        raise ValueError(
            "ORB could not find enough features in the images."
        )

    # BFMatcher with Hamming distance
    matcher = cv2.BFMatcher(
        cv2.NORM_HAMMING,
        crossCheck=True
    )

    matches = matcher.match(
        descriptors1,
        descriptors2
    )

    # Sort by descriptor distance
    matches = sorted(
        matches,
        key=lambda match: match.distance
    )

    processing_time = time.time() - start_time

    # Display the best 30 matches
    display_matches = matches[:30]

    result = cv2.drawMatches(
        image1,
        keypoints1,
        image2,
        keypoints2,
        display_matches,
        None,
        flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
    )

    return {
        "keypoints_image1": len(keypoints1),
        "keypoints_image2": len(keypoints2),
        "matches": len(matches),
        "processing_time": processing_time,
        "result_image": image_to_base64(result)
    }


# =========================================================
# SIFT Feature Matching
# =========================================================

def run_sift(image1, image2):

    start_time = time.time()

    # Create SIFT detector
    sift = cv2.SIFT_create()

    # Detect keypoints and compute descriptors
    keypoints1, descriptors1 = sift.detectAndCompute(
        image1, None
    )

    keypoints2, descriptors2 = sift.detectAndCompute(
        image2, None
    )

    if descriptors1 is None or descriptors2 is None:
        raise ValueError(
            "SIFT could not find enough features in the images."
        )

    # BFMatcher with L2 distance
    matcher = cv2.BFMatcher(
        cv2.NORM_L2
    )

    # Find the two nearest matches
    knn_matches = matcher.knnMatch(
        descriptors1,
        descriptors2,
        k=2
    )

    # Lowe's ratio test
    ratio = 0.75

    good_matches = []

    for match_pair in knn_matches:

        if len(match_pair) == 2:

            best_match, second_best_match = match_pair

            if (
                best_match.distance
                < ratio * second_best_match.distance
            ):
                good_matches.append(best_match)

    # Sort good matches
    good_matches = sorted(
        good_matches,
        key=lambda match: match.distance
    )

    processing_time = time.time() - start_time

    # Display the best 30 good matches
    display_matches = good_matches[:30]

    result = cv2.drawMatches(
        image1,
        keypoints1,
        image2,
        keypoints2,
        display_matches,
        None,
        flags=cv2.DrawMatchesFlags_NOT_DRAW_SINGLE_POINTS
    )

    return {
        "keypoints_image1": len(keypoints1),
        "keypoints_image2": len(keypoints2),
        "matches": len(good_matches),
        "processing_time": processing_time,
        "result_image": image_to_base64(result)
    }


# =========================================================
# Main Matching API
# =========================================================

@app.route("/match", methods=["POST"])
def match_features():

    try:

        # Check that both images were uploaded
        if "image1" not in request.files:
            return jsonify({
                "error": "Image 1 is missing."
            }), 400

        if "image2" not in request.files:
            return jsonify({
                "error": "Image 2 is missing."
            }), 400


        image1_file = request.files["image1"]
        image2_file = request.files["image2"]


        # Read uploaded files
        image1_data = np.frombuffer(
            image1_file.read(),
            np.uint8
        )

        image2_data = np.frombuffer(
            image2_file.read(),
            np.uint8
        )


        # Decode images using OpenCV
        image1 = cv2.imdecode(
            image1_data,
            cv2.IMREAD_COLOR
        )

        image2 = cv2.imdecode(
            image2_data,
            cv2.IMREAD_COLOR
        )


        if image1 is None or image2 is None:
            return jsonify({
                "error": "Could not read one or both images."
            }), 400


        # Get selected method
        method = request.form.get(
            "method",
            "orb"
        ).lower()


        # Run selected algorithm
        if method == "orb":

            result = run_orb(
                image1,
                image2
            )

            result["method"] = "ORB"


        elif method == "sift":

            result = run_sift(
                image1,
                image2
            )

            result["method"] = "SIFT"


        elif method == "both":

            orb_result = run_orb(
                image1,
                image2
            )

            sift_result = run_sift(
                image1,
                image2
            )

            result = {
                "method": "BOTH",
                "orb": orb_result,
                "sift": sift_result
            }


        else:

            return jsonify({
                "error": "Invalid matching method."
            }), 400


        return jsonify(result)


    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


# =========================================================
# Health Check
# =========================================================

@app.route("/", methods=["GET"])
def home():

    return jsonify({
        "status": "online",
        "message": "Feature Matcher backend is running."
    })


# =========================================================
# Run Application
# =========================================================

if __name__ == "__main__":

    print("=" * 50)
    print("FEATURE MATCHER BACKEND")
    print("=" * 50)
    print("ORB + SIFT + BFMatcher")
    print("Server: http://127.0.0.1:5000")
    print("=" * 50)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )