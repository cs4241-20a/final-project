let mic = document.getElementById("mic");
let chatareamain = document.querySelector('.chatarea-main');
let chatareaouter = document.querySelector('.chatarea-outer');

let enrollment = ["WPI has a total undergraduate enrollment of 4,761", "1,200 Freshman enrolled at WPI last year", "WPI has a 41.6% acceptance rate"];
let majors = ["There are 33 different majors to choose from at WPI","Mechanical Engineering, Computer Science, Electrical and Electronics Engineering, Chemical Engineering and Robotics are the most common majors at WPI"];
let ratio = ["WPI consits of approximated 60% male and 40% female students", "The freshmn class consists of 56% male and 44% female students"];
let testing = ["Students and Faculty at WPI are tested on a weekly basis", "All students are encouraged to stay on campus and are required to get tested on their regular testing days", "Students who live on campus and athletes are required to get tested twice a week, while off campus students get tested once a week."];
let dorms = ["Freshman this year are living in both dorms and the Hampon Inn Hotel nearby", "There are 9 different dorm buildings for freshman to live in", "Housing options include: Morgan Hall, Daniels Hall, Riley Hall, Stoddard Complex, Founders Hall, Messanger Hall and Institute Hall"];
let activities = ["WPI offers 225 different clubs and organizations to be involved in","Popular organizations at WPI include fraternity/sorority life, Student Association Organization, different club sports, specific major oganizations such as 'Society of women in engineering' and student band"];
let projects = ["IQP and MQP are on eof the main reasons student come to WPI", "You can travel all across the world to complete your projects here at WPI", "WPI is a project-based school and the ciriculum is focused around project-based learning"]
let closing = ["I hope I was able to help","You can find more information on the WPI website","Hope to see you on campussoon!"]

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

function showusermsg(usermsg){
    let output = '';
    output += `<div class="chatarea-inner user">${usermsg}</div>`;
    chatareaouter.innerHTML += output;
    return chatareaouter;
}

function showchatbotmsg(chatbotmsg){
    let output = '';
    output += `<div class="chatarea-inner chatbot">${chatbotmsg}</div>`;
    chatareaouter.innerHTML += output;
    return chatareaouter;
}

function chatbotvoice(message){
    const speech = new SpeechSynthesisUtterance();
    speech.text = "Ask me some questions!";
    if(message.includes('enrollment')){
        let talk = enrollment[Math.floor(Math.random() * enrollment.length)];
        speech.text = talk;
    }
    if(message.includes('majors')){
        let talk = majors[Math.floor(Math.random() * majors.length)];
        speech.text = talk;
    }
    if(message.includes('gender ratio' || 'how many females')){
        let talk = ratio[Math.floor(Math.random() * ratio.length)];
        speech.text = talk;
    }
    if(message.includes('testing' || 'testing on campus' || 'virus')){
        let talk = testing[Math.floor(Math.random() * testing.length)];
        speech.text = talk;
    }
    if(message.includes('living arrangements' || 'dorms' || 'living'||'residence')){
        let talk = dorms[Math.floor(Math.random() * dorms.length)];
        speech.text = talk;
    }
    if(message.includes('activities on campus' || 'activities' || 'organizations'|| 'clubs')){
        let talk = activities[Math.floor(Math.random() * activities.length)];
        speech.text = talk;
    }
    if(message.includes('projects' || 'research')){
        let talk = projects[Math.floor(Math.random() * projects.length)];
        speech.text = talk;
    }
    if(message.includes('thank you' || 'bye' || 'thanks')){
        let talk = closing[Math.floor(Math.random() * closing.length)];
        speech.text = talk;
    }
    window.speechSynthesis.speak(speech);
    chatareamain.appendChild(showchatbotmsg(speech.text));
}

recognition.onresult=function(e){
    let resultIndex = e.resultIndex;
    let transcript = e.results[resultIndex][0].transcript;
    chatareamain.appendChild(showusermsg(transcript));
    chatbotvoice(transcript);
    console.log(transcript);
}
recognition.onend=function(){
    mic.style.background="#ff3b3b";
}
mic.addEventListener("click", function(){
    mic.style.background='#39c81f';
    recognition.start();
    console.log("Activated");
})