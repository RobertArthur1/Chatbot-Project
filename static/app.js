class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            historyButton: document.querySelector('#historyButton'),
            historyPanel: document.querySelector('#historyPanel'),
            closeHistoryButton: document.querySelector('.close-history')
        }

        this.state = false;
        this.messages = [];
        this.currentConversation = [];
    }

    display() {
        const {openButton, chatBox, sendButton, historyButton, historyPanel, closeHistoryButton} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })

        historyButton.addEventListener('click', () => this.openHistory())
        closeHistoryButton.addEventListener('click', () => this.closeHistory());
    }

    toggleState(chatbox) {
        this.state = !this.state;

        // show or hide the box
        if(this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);
        this.currentConversation.push(msg1);
        this.saveConversation();

        fetch($SCRIPT_ROOT + '/predict', {
            method: 'POST',
            body: JSON.stringify({ message: text1 }),
            mode: 'cors',
            headers: {
              'Content-Type': 'application/json'
            },
          })
          .then(r => r.json())
          .then(r => {
            let msg2 = { name: "AJU", message: r.answer };
            this.messages.push(msg2);
            this.currentConversation.push(msg2);
            this.saveConversation();
            this.updateChatText(chatbox)
            textField.value = ''

        }).catch((error) => {
            console.error('Error:', error);
            this.updateChatText(chatbox)
            textField.value = ''
          });
    }

    saveConversation() {
        let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
        let currentDate = new Date().toLocaleDateString();
        let firstMessage = this.currentConversation[0]?.message || "";
        let title = `${currentDate} - ${firstMessage}`;

        let conversation = {
            title: title,
            messages: [...this.currentConversation]
        };

        history = history.filter(conv => conv.title !== title);
        history.push(conversation);
        localStorage.setItem("chatHistory", JSON.stringify(history));
    }

    loadHistory() {
        let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
        const chatHistory = document.querySelector('#chatHistory');
        chatHistory.innerHTML = '';
        history.forEach((conv, index) => {
            let conversationElement = document.createElement("div");
            conversationElement.classList.add("chat-conversation");
            conversationElement.textContent = conv.title;

            let deleteButton = document.createElement("button");
            deleteButton.textContent = "Delete";
            deleteButton.classList.add("delete-button");
            deleteButton.addEventListener("click", () => {
                this.deleteConversation(index);
            });

            conversationElement.appendChild(deleteButton);
            conversationElement.addEventListener("click", () => {
                this.messages = conv.messages;
                this.updateChatText(document.querySelector('.chatbox__support'));
                this.closeHistory();
            });

            chatHistory.appendChild(conversationElement);
        });
    }

    deleteConversation(index) {
        let history = JSON.parse(localStorage.getItem("chatHistory")) || [];
        history.splice(index, 1);
        localStorage.setItem("chatHistory", JSON.stringify(history));
        this.loadHistory();
    }

    openHistory() {
        this.loadHistory();
        this.args.historyPanel.style.width = "300px"; /* Adjust width as needed */
    }

    closeHistory() {
        this.args.historyPanel.style.width = "0";
    }

    updateChatText(chatbox) {
        var html = '';
        this.messages.slice().reverse().forEach(function(item, index) {
            if (item.name === "AJU")
            {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
            }
            else
            {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
          });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
    }
}

const chatbox = new Chatbox();
chatbox.display();
