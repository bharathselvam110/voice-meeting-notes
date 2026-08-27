const $=id=>document.getElementById(id);
const transcript=$("transcript"), status=$("status"), count=$("count");
$("meetingDate").value=new Date().toISOString().slice(0,10);

const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
let rec=null, listening=false;
if(SR){
  rec=new SR(); rec.continuous=true; rec.interimResults=true; rec.lang="en-IN";
  rec.onstart=()=>{listening=true;status.textContent="🔴 Listening...";}
  rec.onresult=e=>{
    let t="";
    for(let i=e.resultIndex;i<e.results.length;i++) if(e.results[i].isFinal) t+=e.results[i][0].transcript+" ";
    if(t){transcript.value+=t;updateCount();}
  };
  rec.onend=()=>{if(listening){try{rec.start()}catch(e){}}};
}
$("startBtn").onclick=()=>{if(!rec)return alert("Use Chrome or Edge for speech recognition."); if(!listening)rec.start();}
$("stopBtn").onclick=()=>{listening=false;if(rec)rec.stop();status.textContent="Recording stopped";}

function updateCount(){
  const t=transcript.value.trim();
  count.textContent=`${t?t.split(/\s+/).length:0} words • ${transcript.value.length} characters`;
}
transcript.oninput=updateCount;

let meetings=JSON.parse(localStorage.getItem("voiceMeetings")||"[]");
let currentId=null;

function render(search=""){
  $("meetingList").innerHTML="";
  meetings.filter(m=>m.title.toLowerCase().includes(search.toLowerCase())).slice(0,6).forEach(m=>{
    const d=document.createElement("div");
    d.className="meeting-item";
    d.innerHTML=`<strong>${m.title}</strong><br><small>${m.date||""}</small>`;
    d.onclick=()=>load(m.id);
    $("meetingList").appendChild(d);
  });
}
function load(id){
  const m=meetings.find(x=>x.id===id); if(!m)return;
  currentId=id;$("meetingTitle").value=m.title;$("meetingDate").value=m.date;
  $("attendees").value=m.attendees;transcript.value=m.transcript;$("summary").textContent=m.summary||"";
  updateCount();
}
function getCookie(name) {
    let cookieValue = null;

    if (document.cookie) {
        const cookies = document.cookie.split(";");

        for (let cookie of cookies) {
            cookie = cookie.trim();

            if (cookie.startsWith(name + "=")) {
                cookieValue = decodeURIComponent(
                    cookie.substring(name.length + 1)
                );

                break;
            }
        }
    }

    return cookieValue;
}


$("saveBtn").onclick = async function () {

    const meetingData = {
        title: $("meetingTitle").value.trim(),

        date: $("meetingDate").value,

        attendees: $("attendees").value.trim(),

        transcript: transcript.value,

        summary: $("summary").textContent
    };


    if (!meetingData.title) {
        alert("Please enter meeting title.");
        return;
    }


    if (!meetingData.date) {
        alert("Please select meeting date.");
        return;
    }


    try {

        const response = await fetch(
            "/api/meetings/save/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",

                    "X-CSRFToken": getCookie("csrftoken")
                },

                body: JSON.stringify(meetingData)
            }
        );


        const data = await response.json();


        if (response.ok) {

            alert("Meeting saved to database!");

            console.log(
                "Saved Meeting ID:",
                data.id
            );

        } else {

            alert(
                data.error ||
                "Could not save meeting."
            );

        }

    } catch (error) {

        console.error(error);

        alert("Server connection error.");
    }

};
$("searchInput").oninput=e=>render(e.target.value);
$("newMeetingBtn").onclick=()=>{currentId=null;$("meetingTitle").value="";$("attendees").value="";transcript.value="";$("summary").textContent="Your summary will appear here.";updateCount();}
$("summaryBtn").onclick=()=>{const t=transcript.value.trim();if(!t)return alert("Add transcript first.");$("summary").textContent=(t.match(/[^.!?]+[.!?]+/g)||[t]).slice(0,3).join(" ");};
$("addActionBtn").onclick=()=>{const d=document.createElement("div");d.className="action-row";d.innerHTML='<input placeholder="Action item"><input type="date"><button>Delete</button>';d.querySelector("button").onclick=()=>d.remove();$("actions").appendChild(d);};
render();updateCount();
