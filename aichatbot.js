let prompt = document.querySelector("#prompt");
let chatcontainer = document.querySelector(".chat-container");
let imagebtn = document.querySelector("#image");
let imageinput = document.querySelector("#image input");

const Api_Url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCy2P5TaYn-0Ud20hebj-r3OAE6lLj-vAw";

let user = {
  message: null,
  file: {
    mime_type: null,
    data: null,
  },
};

async function generateResponse(aichatbox) {
  let text = aichatbox.querySelector(".ai-chat-area");

  const parts = [{ text: user.message }];
  if (user.file.data) {
    parts.push({ inline_data: user.file });
  }

  let RequestOption = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: parts,
        },
      ],
    }),
  };

  try {
    let response = await fetch(Api_Url, RequestOption);
    let data = await response.json();

    let apiresponse =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.replace(/\*\*(.*?)\*\*/g, "$1").trim() ||
      "Error: No response from AI.";
    text.innerHTML = apiresponse;
  } catch (error) {
    console.error(error);
    text.innerHTML = "Error generating response.";
  } finally {
    chatcontainer.scrollTo({ top: chatcontainer.scrollHeight, behavior: "smooth" });
  }
}

function createchatbox(html, classes) {
  let div = document.createElement("div");
  div.innerHTML = html;
  div.classList.add(classes);
  return div;
}

function handlechatResponse(usermessage) {
  user.message = usermessage;

  let html = `
    <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrBp4rAadRiXmk6NWl3redkvGJgWGDkBT4vA&s"
    alt="user-image" id="userImage" width="50">
    <div class="user-chat-area">
      ${user.message}
      ${
        user.file.data
          ? `<img src="data:${user.file.mime_type};base64,${user.file.data}" class="chooseimg"/>`
          : ""
      }
    </div>`;

  prompt.value = "";
  imageinput.value = ""; // Reset file input

  let userChatbox = createchatbox(html, "user-chat-box");
  chatcontainer.appendChild(userChatbox);

  chatcontainer.scrollTo({ top: chatcontainer.scrollHeight, behavior: "smooth" });

  setTimeout(() => {
    let html = `
      <img src="https://media.istockphoto.com/id/1482901838/vector/3d-artificial-intelligence-digital-brain-neural-network-ai-servers-and-robots-technology.jpg?s=612x612&w=0&k=20&c=Shb9zTKQCpPkTzFvhFr8eGuGdYyHRGXI2mmrvuahkqM=" 
      alt="ai-image" id="aiImage" width="50">
      <div class="ai-chat-area">
        <span class="load">...</span>
      </div>`;
    let aichatbox = createchatbox(html, "ai-chat-box");
    chatcontainer.appendChild(aichatbox);
    generateResponse(aichatbox);
  }, 600);

  // Reset user.file after sending
  user.file = {
    mime_type: null,
    data: null,
  };
}


prompt.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const file = imageinput.files[0];
    if (file) {
      let reader = new FileReader();
      reader.onload = (event) => {
        let base64string = event.target.result.split(",")[1];
        user.file = {
          mime_type: file.type,
          data: base64string,
        };
        handlechatResponse(prompt.value);
      };
      reader.readAsDataURL(file);
    } else {
      handlechatResponse(prompt.value);
    }
  }
});

imageinput.addEventListener("change", () => {
  const file = imageinput.files[0];
  if (!file) return;
  let reader = new FileReader();
  reader.onload = (e) => {
    let base64 = e.target.result.split(",")[1];
    user.file = { mime_type: file.type, data: base64 };
  };
  reader.readAsDataURL(file);
});

imagebtn.addEventListener("click", () => {
  imageinput.click();
});
