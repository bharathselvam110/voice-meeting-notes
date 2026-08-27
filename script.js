// ===========================
// ICONS
// ===========================

lucide.createIcons();


// ===========================
// ELEMENTS
// ===========================

const startBtn =
    document.getElementById("startBtn");

const stopBtn =
    document.getElementById("stopBtn");

const transcript =
    document.getElementById("transcript");

const recordStatus =
    document.getElementById("recordStatus");

const statusDot =
    document.getElementById("statusDot");

const timerElement =
    document.getElementById("timer");

const wordCount =
    document.getElementById("wordCount");

const saveBtn =
    document.getElementById("saveBtn");

const newMeetingBtn =
    document.getElementById("newMeetingBtn");

const recentMeetings =
    document.getElementById("recentMeetings");

const searchInput =
    document.getElementById("searchInput");

const summaryBtn =
    document.getElementById("summaryBtn");

const summaryText =
    document.getElementById("summaryText");

const addActionBtn =
    document.getElementById("addActionBtn");


// ===========================
// DEFAULT DATE
// ===========================

document.getElementById(
    "meetingDate"
).value =
    new Date()
        .toISOString()
        .split("T")[0];


// ===========================
// VOICE RECOGNITION
// ===========================

const SpeechRecognition =
    window.SpeechRecognition ||
    window.webkitSpeechRecognition;


let recognition;

let recording = false;

let timerInterval;

let seconds = 0;


if (SpeechRecognition) {

    recognition =
        new SpeechRecognition();


    recognition.continuous =
        true;


    recognition.interimResults =
        true;


    recognition.lang =
        "en-IN";


    recognition.onstart =
        function () {

            recording =
                true;

            recordStatus.innerText =
                "Listening...";

            statusDot.classList.add(
                "active"
            );

            startTimer();

        };


    recognition.onresult =
        function (event) {

            let finalText = "";


            for (
                let i = event.resultIndex;
                i < event.results.length;
                i++
            ) {

                if (
                    event.results[i].isFinal
                ) {

                    finalText +=
                        event.results[i][0]
                            .transcript;

                }

            }


            if (finalText) {

                transcript.value +=
                    finalText + " ";

                updateCount();

            }

        };


    recognition.onend =
        function () {

            if (recording) {

                try {

                    recognition.start();

                }

                catch (error) {

                    console.log(error);

                }

            }

        };


    recognition.onerror =
        function (event) {

            console.log(
                event.error
            );

        };

}


startBtn.addEventListener(
    "click",
    function () {

        if (!SpeechRecognition) {

            alert(
                "Speech Recognition is not supported in this browser. Try Chrome."
            );

            return;

        }


        if (!recording) {

            seconds = 0;

            recognition.start();

        }

    }
);


stopBtn.addEventListener(
    "click",
    function () {

        recording =
            false;


        if (recognition) {

            recognition.stop();

        }


        recordStatus.innerText =
            "Recording stopped";


        statusDot.classList.remove(
            "active"
        );


        stopTimer();

    }
);


// ===========================
// TIMER
// ===========================

function startTimer() {

    stopTimer();


    timerInterval =
        setInterval(
            function () {

                seconds++;

                const minutes =
                    Math.floor(
                        seconds / 60
                    );

                const remainingSeconds =
                    seconds % 60;


                timerElement.innerText =

                    String(minutes)
                        .padStart(2, "0")

                    +

                    ":"

                    +

                    String(
                        remainingSeconds
                    )
                        .padStart(2, "0");

            },
            1000
        );

}


function stopTimer() {

    clearInterval(
        timerInterval
    );

}


// ===========================
// WORD COUNT
// ===========================

function updateCount() {

    const text =
        transcript.value.trim();


    const words =
        text === ""
            ? 0
            : text.split(/\s+/).length;


    wordCount.innerText =
        `${words} words • ${transcript.value.length} characters`;

}


transcript.addEventListener(
    "input",
    updateCount
);


// ===========================
// CLEAR TRANSCRIPT
// ===========================

document
    .getElementById(
        "clearTranscript"
    )
    .addEventListener(
        "click",
        function () {

            transcript.value =
                "";

            updateCount();

        }
    );


// ===========================
// MEETING STORAGE
// ===========================

let meetings =
    JSON.parse(
        localStorage.getItem(
            "voiceMeetings"
        )
    ) || [];


let currentMeetingId =
    null;


// ===========================
// SAVE
// ===========================

saveBtn.addEventListener(
    "click",
    function () {

        const title =
            document.getElementById(
                "meetingTitle"
            ).value.trim();


        const date =
            document.getElementById(
                "meetingDate"
            ).value;


        const attendees =
            document.getElementById(
                "attendees"
            ).value.trim();


        if (!title) {

            alert(
                "Please enter meeting title."
            );

            return;

        }


        const meeting = {

            id:
                currentMeetingId ||
                Date.now(),

            title:
                title,

            date:
                date,

            attendees:
                attendees,

            transcript:
                transcript.value,

            summary:
                summaryText.innerText

        };


        if (currentMeetingId) {

            const index =
                meetings.findIndex(
                    item =>
                        item.id ===
                        currentMeetingId
                );


            meetings[index] =
                meeting;

        }

        else {

            meetings.unshift(
                meeting
            );

        }


        localStorage.setItem(
            "voiceMeetings",
            JSON.stringify(
                meetings
            )
        );


        currentMeetingId =
            meeting.id;


        displayMeetings();


        alert(
            "Meeting notes saved successfully!"
        );

    }
);


// ===========================
// DISPLAY MEETINGS
// ===========================

function displayMeetings(
    search = ""
) {

    recentMeetings.innerHTML =
        "";


    const filtered =
        meetings.filter(
            meeting =>

                meeting.title
                    .toLowerCase()
                    .includes(
                        search
                            .toLowerCase()
                    )

        );


    filtered
        .slice(0, 5)
        .forEach(
            meeting => {

                const div =
                    document.createElement(
                        "div"
                    );


                div.className =
                    "meeting-item";


                div.innerHTML = `

                    <h4>
                        ${meeting.title}
                    </h4>

                    <p>
                        📅 ${meeting.date}
                    </p>

                `;


                div.addEventListener(
                    "click",
                    function () {

                        loadMeeting(
                            meeting.id
                        );

                    }
                );


                recentMeetings
                    .appendChild(
                        div
                    );

            }
        );

}


// ===========================
// LOAD MEETING
// ===========================

function loadMeeting(id) {

    const meeting =
        meetings.find(
            meeting =>
                meeting.id === id
        );


    if (!meeting) {

        return;

    }


    currentMeetingId =
        meeting.id;


    document.getElementById(
        "meetingTitle"
    ).value =
        meeting.title;


    document.getElementById(
        "meetingDate"
    ).value =
        meeting.date;


    document.getElementById(
        "attendees"
    ).value =
        meeting.attendees;


    transcript.value =
        meeting.transcript;


    summaryText.innerText =
        meeting.summary ||
        "No summary available.";


    updateCount();

}


// ===========================
// SEARCH
// ===========================

searchInput.addEventListener(
    "input",
    function () {

        displayMeetings(
            searchInput.value
        );

    }
);


// ===========================
// NEW MEETING
// ===========================

newMeetingBtn.addEventListener(
    "click",
    function () {

        currentMeetingId =
            null;


        document.getElementById(
            "meetingTitle"
        ).value =
            "";


        document.getElementById(
            "attendees"
        ).value =
            "";


        document.getElementById(
            "meetingDate"
        ).value =
            new Date()
                .toISOString()
                .split("T")[0];


        transcript.value =
            "";


        summaryText.innerText =
            "Your generated meeting summary will appear here.";


        updateCount();

    }
);


// ===========================
// DEMO SUMMARY
// ===========================

summaryBtn.addEventListener(
    "click",
    function () {

        const text =
            transcript.value.trim();


        if (!text) {

            alert(
                "Please record or enter meeting notes first."
            );

            return;

        }


        const sentences =
            text.match(
                /[^.!?]+[.!?]+/g
            ) || [text];


        const summary =
            sentences
                .slice(0, 3)
                .join(" ")
                .trim();


        summaryText.innerText =
            summary;

    }
);


// ===========================
// ADD ACTION ITEM
// ===========================

addActionBtn.addEventListener(
    "click",
    function () {

        const container =
            document.getElementById(
                "actionItems"
            );


        const row =
            document.createElement(
                "div"
            );


        row.className =
            "action-item";


        row.innerHTML = `

            <input
                type="checkbox"
            >

            <input
                class="action-text"
                placeholder="Enter action item"
            >

            <input
                class="action-date"
                type="date"
            >

            <button
                class="delete-action"
            >
                <i data-lucide="trash-2"></i>
            </button>

        `;


        container.appendChild(
            row
        );


        lucide.createIcons();


        addDeleteEvents();

    }
);


// ===========================
// DELETE ACTION ITEM
// ===========================

function addDeleteEvents() {

    document
        .querySelectorAll(
            ".delete-action"
        )
        .forEach(
            button => {

                button.onclick =
                    function () {

                        button
                            .closest(
                                ".action-item"
                            )
                            .remove();

                    };

            }
        );

}


addDeleteEvents();


// ===========================
// START
// ===========================

displayMeetings();

updateCount();