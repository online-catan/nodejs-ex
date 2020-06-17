var socket = io.connect('http://localhost:3000');
socket.on('connect', function(data) {
    socket.emit('join', {msg: "Hello World from host",
                        type: "host"});
    socket.on('receive_click_id', (data) => {
        console.log(data.click_id);
        let player_no = gameState.currentPlayer.number;
        if (data.player_id == "player" + player_no.toString()){
            document.getElementById(data.click_id).click();
        } else if (document.getElementById(data.click_id).classList[0] == "select_display") {
            document.getElementById(data.click_id).click();
        }
    });
});

$(document).click(function(event) {
    sendUpdatedPage();
});

function sendUpdatedPage() {
    var data = {};
    data.body_html = document.getElementById("main_div").innerHTML;
    socket.emit('send_updated_page', data);
}