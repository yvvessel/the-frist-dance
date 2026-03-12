async function loadTeam() {

    const response = await fetch("http://localhost:3000/team")
    await new Promise(resolve => setTimeout(resolve, 1000))
    const players = await response.json()

    const container = document.querySelector(".players_container")

    // descobrir MVP
    let mvp = players[0]

    players.forEach(player => {
        if(player.rr > mvp.rr){
            mvp = player
        }
    })

    players.forEach(player => {

        const name = player.name.toLowerCase().replace(/\s+/g, "")

        const rankText = document.getElementById("rank-" + name)
        const rankImg = document.getElementById("ranking-" + name)

        if(rankText){

    const rank = document.createElement("span")
    rank.textContent = player.rank + " • " + player.rr + " RR"

    rankText.innerHTML = ""
    rankText.appendChild(rank)

}

        if(rankImg){
            rankImg.src = getRankImage(player.rank)
        }

    })

    // mover MVP para o meio
    const mvpCard = document.querySelector(`[data-player="${mvp.name}"]`)

if (mvpCard) {

    const cards = Array.from(container.children)
    const middleIndex = Math.floor(cards.length / 2)

    // remove da posição atual
    container.removeChild(mvpCard)

    // insere exatamente no meio
    container.insertBefore(mvpCard, container.children[middleIndex])

    mvpCard.classList.add("player_card_mvp")

}

}

loadTeam()

//rank imagens
function getRankImage(rank){
    return "/assets/images/ranks/" + rank.toLowerCase().replace(/\s+/g, "_") +  "_" + "Rank" + ".png"
}
