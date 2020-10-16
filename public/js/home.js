window.onload = async () => {
	const res = await fetch("/api/groups", {method: "GET"});
	const data = await res.json();
	console.log(JSON.stringify(data));
}