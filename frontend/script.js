// =========================================================
// FEATURE MATCHER
// Frontend ↔ Flask Backend
// =========================================================


// ---------- Elements ----------

const image1Input = document.getElementById("image1");
const image2Input = document.getElementById("image2");

const uploadCards =
    document.querySelectorAll(".image-upload-card");

const browseButtons =
    document.querySelectorAll(".browse-button");

const algorithmCards =
    document.querySelectorAll(".algorithm-card");

const matchButton =
    document.getElementById("matchButton");

const keypointsStat =
    document.getElementById("keypointsStat");

const matchesStat =
    document.getElementById("matchesStat");

const timeStat =
    document.getElementById("timeStat");

const methodStat =
    document.getElementById("methodStat");

const resultStatus =
    document.getElementById("resultStatus");

const resultImage =
    document.getElementById("resultImage");


// ---------- Application State ----------

let selectedMethod = "orb";

let image1File = null;
let image2File = null;


// ---------- Browse Buttons ----------

browseButtons[0].addEventListener("click", () => {
    image1Input.click();
});

browseButtons[1].addEventListener("click", () => {
    image2Input.click();
});


// ---------- Image Selection ----------

image1Input.addEventListener("change", () => {

    if (image1Input.files.length > 0) {

        image1File = image1Input.files[0];

        updateUploadCard(
            uploadCards[0],
            image1File
        );
    }
});


image2Input.addEventListener("change", () => {

    if (image2Input.files.length > 0) {

        image2File = image2Input.files[0];

        updateUploadCard(
            uploadCards[1],
            image2File
        );
    }
});


function updateUploadCard(card, file) {

    const content =
        card.querySelector(".upload-content");

    // Create a temporary URL for the uploaded image
    const imageURL =
        URL.createObjectURL(file);

    // Safely display the filename
    const safeFileName =
        file.name
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    const fileSize =
        (file.size / 1024 / 1024).toFixed(2) +
        " MB";


    content.innerHTML = `
        <div class="image-preview-wrapper">

            <img
                src="${imageURL}"
                class="image-preview"
                alt="Selected image"
            >

            <div class="image-preview-overlay">
                <span>IMAGE READY</span>
            </div>

        </div>

        <div class="selected-file-info">

            <h3 title="${safeFileName}">
                ${safeFileName}
            </h3>

            <p>
                ${fileSize} · Ready for matching
            </p>

        </div>

        <button class="browse-button change-image">
            Change Image
        </button>
    `;


    const changeButton =
        content.querySelector(".change-image");


    changeButton.addEventListener("click", () => {

        if (card === uploadCards[0]) {

            image1Input.click();

        } else {

            image2Input.click();

        }

    });
}

// ---------- Algorithm Selection ----------

algorithmCards.forEach(card => {

    card.addEventListener("click", () => {

        algorithmCards.forEach(item => {
            item.classList.remove("active");
        });

        card.classList.add("active");

        selectedMethod =
            card.dataset.method;

        resultStatus.textContent =
            `${selectedMethod.toUpperCase()} selected`;
    });

});


// ---------- Match Features ----------

matchButton.addEventListener("click", async () => {

    // Check images
    if (!image1File || !image2File) {

        resultStatus.textContent =
            "Please upload both images.";

        return;
    }


    // Loading state
    matchButton.disabled = true;

    matchButton.innerHTML = `
        <span>Processing Features...</span>
        <span class="arrow">◌</span>
    `;

    resultStatus.textContent =
        "Running OpenCV feature matching...";


    // Create form data
    const formData = new FormData();

    formData.append(
        "image1",
        image1File
    );

    formData.append(
        "image2",
        image2File
    );

    formData.append(
        "method",
        selectedMethod
    );


    try {

        // Send request to Flask
        const response = await fetch(
            "http://127.0.0.1:5000/match",
            {
                method: "POST",
                body: formData
            }
        );


        const data = await response.json();


        // Handle backend error
        if (!response.ok) {

            throw new Error(
                data.error ||
                "Feature matching failed."
            );
        }


        // Handle result
        displayResults(data);


    } catch (error) {

        console.error(error);

        resultStatus.textContent =
            "Error: " + error.message;


        keypointsStat.textContent = "—";
        matchesStat.textContent = "—";
        timeStat.textContent = "—";
        methodStat.textContent = "—";


        resultImage.hidden = true;


        const emptyResult =
            document.querySelector(".empty-result");


        if (emptyResult) {

            emptyResult.style.display = "block";

            emptyResult.querySelector("h3").textContent =
                "Unable to process images";

            emptyResult.querySelector("p").textContent =
                error.message;
        }


    } finally {

        matchButton.disabled = false;

        matchButton.innerHTML = `
            <span>Match Features</span>
            <span class="arrow">→</span>
        `;
    }

});


// ---------- Display Results ----------

function displayResults(data) {

    const emptyResult =
        document.querySelector(".empty-result");


    // -----------------------------------------
    // BOTH mode
    // -----------------------------------------

    if (data.method === "BOTH") {

        const orb = data.orb;
        const sift = data.sift;


        // Show SIFT visualization by default
        resultImage.src =
            "data:image/jpeg;base64," +
            sift.result_image;

        resultImage.hidden = false;


        if (emptyResult) {
            emptyResult.style.display = "none";
        }


        // Show combined summary
        keypointsStat.textContent =
            `${orb.keypoints_image1} / ${orb.keypoints_image2}`;

        matchesStat.textContent =
            `ORB ${orb.matches} · SIFT ${sift.matches}`;

        const averageTime =
            (
                orb.processing_time +
                sift.processing_time
            ).toFixed(3);

        timeStat.textContent =
            `${averageTime}s`;

        methodStat.textContent =
            "ORB + SIFT";

        resultStatus.textContent =
            `Comparison complete · SIFT visualization shown`;

        return;
    }


    // -----------------------------------------
    // Single algorithm mode
    // -----------------------------------------

    resultImage.src =
        "data:image/jpeg;base64," +
        data.result_image;

    resultImage.hidden = false;


    if (emptyResult) {
        emptyResult.style.display = "none";
    }


    // Statistics
    keypointsStat.textContent =
        `${data.keypoints_image1} / ${data.keypoints_image2}`;

    matchesStat.textContent =
        data.matches;

    timeStat.textContent =
        `${data.processing_time.toFixed(3)}s`;

    methodStat.textContent =
        data.method;


    resultStatus.textContent =
        `${data.method} matching complete`;
}