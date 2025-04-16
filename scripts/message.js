document.addEventListener("DOMContentLoaded", () => {
	const webhookURL = "https://discord.com/api/webhooks/1362110993341091840/3c30YAeAm5EOKw35_RFFI-D--_fxQp8R7L_NRmelk4sLMNvav5hrnLf35YZV6imJrAYJ";
	const messageInput = document.getElementById("message-input");
	let lastMessageTime = 0;

	messageInput.addEventListener("keydown", (e) => {
		if (e.key === "Enter" && messageInput.value.trim() !== "") {
			const currentTime = Date.now();
			if (currentTime - lastMessageTime >= 5000) {
				const messageContent = sanitizeMessage(messageInput.value);
				sendMessage(messageContent);
				messageInput.value = "";
				lastMessageTime = currentTime;
			} else {
				alert("🚀 Mesajı göndermek için 5 saniye beklemelisin dostum!");
			}
		}
	});

	function sanitizeMessage(message) {
		// Her ihtimale karşı '@' karakterini bozalım
		return message.replace(/@/g, "@.");
	}

	function sendMessage(message) {
		const data = { content: message };

		fetch(webhookURL, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(data),
		})
			.then((response) => {
				if (!response.ok) throw new Error("Mesaj gönderilemedi!");
			})
			.catch((error) => {
				console.error("Hata:", error.message);
			});
	}
});
