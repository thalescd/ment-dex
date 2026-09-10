// Mensagem de status no header da pagina.

export function statusMsg(input) {
    const header = document.getElementById("appHeader");
    if (!header) return;

    header.querySelectorAll("p.statusMsg").forEach((p) => p.remove());
    if (input === "") return;

    const paragraph = document.createElement("p");
    paragraph.className = "statusMsg";
    paragraph.innerText = input;
    header.append(paragraph);
}
