const userID = "1228030894649118823";

const elements = {
	statusBox: document.querySelector(".status"),
	statusImage: document.getElementById("status-image"),
	displayName: document.querySelector(".display-name"),
	username: document.querySelector(".username"),
	customStatus: document.querySelector(".custom-status"),
	customStatusText: document.querySelector(".custom-status-text"),
	customStatusEmoji: document.getElementById("custom-status-emoji"),
	avatarImage: document.getElementById("avatar-image"),
	bannerImage: document.getElementById("banner-image"),
};

function startWebSocket() {
	const ws = new WebSocket("wss://api.lanyard.rest/socket");
	ws.onopen = () => {
		ws.send(JSON.stringify({ op: 2, d: { subscribe_to_id: userID } }));
	};
	ws.onmessage = (event) => {
		const { t, d } = JSON.parse(event.data);
		if (t === "INIT_STATE" || t === "PRESENCE_UPDATE") {
			updateStatus(d);
		}
	};
	ws.onerror = (error) => {
		console.error("WebSocket Error:", error);
		ws.close();
	};
	ws.onclose = () => {
		console.log("WebSocket closed, trying to reconnect...");
		setTimeout(startWebSocket, 1000);
	};
}

function updateStatus(lanyardData) {
	const { discord_status, activities, discord_user } = lanyardData;
	if (discord_user.banner) {
		const bannerURL = `https://cdn.discordapp.com/banners/${discord_user.id}/${discord_user.banner}.webp?size=600`;
		elements.bannerImage.src = bannerURL;
		elements.bannerImage.style.backgroundColor = "";
	} else if (discord_user.banner_color) {
		elements.bannerImage.src = "";
		elements.bannerImage.style.backgroundColor = discord_user.banner_color;
	}

	elements.displayName.innerHTML = discord_user.display_name;
	elements.username.innerHTML = discord_user.username;

	let imagePath, label;
	switch (discord_status) {
		case "online":
			imagePath = "./public/status/online.svg";
			label = "Çevrimiçi";
			break;
		case "idle":
			imagePath = "./public/status/idle.svg";
			label = "Boşta";
			break;
		case "dnd":
			imagePath = "./public/status/dnd.svg";
			label = "Rahatsız Etmeyin.";
			break;
		case "offline":
		default:
			imagePath = "./public/status/offline.svg";
			label = "Çevrimdışı";
			break;
	}

	const isStreaming = activities.some(
		(activity) =>
			activity.type === 1 &&
			(activity.url?.includes("twitch.tv") || activity.url?.includes("youtube.com"))
	);
	if (isStreaming) {
		imagePath = "./public/status/streaming.svg";
		label = "Yayında!";
	}

	elements.statusImage.src = imagePath;
	elements.statusBox.setAttribute("aria-label", label);

	if (activities[0]?.state) {
		elements.customStatusText.innerHTML = activities[0].state;
	} else {
		elements.customStatusText.innerHTML = "Hiçbir Şey Yapmıyor.";
	}

	const emoji = activities[0]?.emoji;
	if (emoji?.id) {
		elements.customStatusEmoji.src = `https://cdn.discordapp.com/emojis/${emoji.id}.webp?size=24&quality=lossless`;
		elements.customStatusEmoji.style.display = "block";
	} else if (emoji?.name) {
		elements.customStatusEmoji.src = "./public/icons/poppy.png";
		elements.customStatusEmoji.style.display = "block";
	} else {
		elements.customStatusEmoji.style.display = "none";
	}

	if (!activities[0]?.state && !emoji) {
		elements.customStatus.style.display = "none";
	} else {
		elements.customStatus.style.display = "flex";
	}
}

function updateClock() {
	const now = new Date();
	const hours = now.getHours().toString().padStart(2, "0");
	const minutes = now.getMinutes().toString().padStart(2, "0");
	const seconds = now.getSeconds().toString().padStart(2, "0");
	const timeString = `${hours}:${minutes}:${seconds}`;
	document.getElementById("clock").textContent = timeString;
}

setInterval(updateClock, 1000);
updateClock();
startWebSocket();

function restartGIFs() {
	const emojis = document.querySelectorAll(".emoji");
	emojis.forEach((img) => {
		const src = img.getAttribute("data-src");
		img.src = "";
		img.src = src; 
	});
}
window.addEventListener("load", () => {
	restartGIFs();
});
setInterval(restartGIFs, 3000); // 10 Saniyede Bir
