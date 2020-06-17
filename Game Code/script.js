class Player {
	constructor(colour) {
		this.cards = [];
		this.resCards = [];
		this.devCards = [];
		this.colour = colour;
		this.number = PLAYER_COLOURS.indexOf(colour) + 1;
		this.assets = {};
	}

	receiveResource(resource, qty) {
		for (let i = 0; i < qty; i++) {
			let resCard = new ResCard(resource);
			this.resCards.push(resCard);
			let card_im = gameState.table.leftPanel.addResCardToDisplay(resCard, this.number);
			resCard.setElement(card_im);
		}
	}

	getResources() {
		let resources = {};
		for (let name of RESOURCE_NAMES) {
			resources[name] = 0;
		}

		let res;
		for (let resCard of this.resCards) {
			res = resCard.resource;
			resources[res] += 1;
		}
		return resources;
	}

	attemptPurchase(product) {
		let required_resources;
		if (product == "road") {
			required_resources = PURCHASE_ROAD_REQ_RESOURCES;
		} else if (product == "settlement") {
			required_resources = PURCHASE_SETTLEMENT_REQ_RESOURCES;
		} else if (product == "city") {
			required_resources = PURCHASE_CITY_REQ_RESOURCES;
		} else if (product == "dev_card") {
			required_resources = PURCHASE_DEVCARD_REQ_RESOURCES;
		} else {
			console.log("Attempt to purchase non-identifiable product");
			return;
		}
		let resources = this.getResources();
		let enough_res = true;
		for (let res_name of RESOURCE_NAMES) {
			if (required_resources[res_name] && resources[res_name] < required_resources[res_name]) {
				enough_res = false;
				break;
			}
		}
		if (enough_res) {
			this.acquire(product, required_resources);
			return true;
		} else {
			return false;
		}
	}

	acquire(product, required_resources) {
		let {resCards} = this;
		let res_cost, resCard;
		for (let res_name of RESOURCE_NAMES) {
			res_cost = required_resources[res_name];
			for (let i = 0; i < res_cost; i++) {
				for (let j = resCards.length - 1; j >= 0; j--) {
					resCard = resCards[j];
					if (resCard.resource == res_name) {
						this.discardResCard(resCard);
						break;
					}
				}
			}
		}
	}

	discardResource(resource, qty) {
		let no_discarded = 0;
		let {resCards} = this, resCard;
		for (let i = resCards.length - 1; i >= 0; i--) {
			resCard = resCards[i];
			if (resCard.resource == resource) {
				this.discardResCard(resCard);
				no_discarded++;
			}
			if (no_discarded == qty) {
				return;
			}
		}
	}

	discardResCard(resCard) {
		resCard.element.parentNode.removeChild(resCard.element);
		let ind = this.resCards.indexOf(resCard);
		this.resCards.splice(ind,1);
		this.rearrangeResCards();
	}

	drawDevCard(deck) {
		let card = deck.cards.shift();
		this.devCards.push(card);
		gameState.table.leftPanel.addDevCardToDisplay(card, this.number);
		card.setupForClick();
	}
	hasDevCard() {
		return !!this.devCards.length;
	}
	hasUsableDevCard() {
		let cards_beenUsed = this.devCards.map( devCard => devCard.beenUsed());
		let cards_unused = cards_beenUsed.map(beenUsed => !beenUsed);
		for (let unused of cards_unused) {
			if (unused) {
				return true;
			}
		}
		return false;
	}
	rearrangeResCards() {
		let { resCards } = this;
		let resCard, im_element, offset;
		for (let i = 0; i < resCards.length; i++) {
			resCard = resCards[i];
			im_element = resCard.element;
			offset = i * DISPLAYED_RES_CARD_OFFSET;
			im_element.style.left = offset;
		}
		let max_offset = offset;
		gameState.table.leftPanel.res_card_containers[this.number - 1].style.left = -max_offset/2;
	}

	tradeIn(resource) {
		let resources = this.getResources();
		let qty_owned = resources[resource];
		if (qty_owned > 4) {
			for (let i = 0; i < qty_owned; i++) {
				this.discardResCard()
			}
		}
	}

	identifyLinesOwned(all_lines) {
		let lines = [];
		for (let line of all_lines) {
			if (line.isRoad()){
				if (line.player == this) {
					lines.push(line);
				}
			}
		}
		return lines;
	}
}

class ResCard {
	constructor(resource) {
		this.resource = resource;
	}

	setElement(card_im) {
		this.element = card_im;
	}
}

class Deck {
	constructor() {
		this.cards = []
		this.createCards();
		this.shuffle();
	}
	createCards() {
		let card_no;
		
		for (let card_name of DECK_CARD_NAMES) {
			card_no = DEV_CARD_DECK_COMPOSITION[card_name];
			for (let i = 0; i < card_no; i++) {
				this.cards.push(new DevCard(card_name));
			}
		}
	}
	shuffle() {
		let iters = 5;
		let m = this.cards.length, rand;

		for (var i =0; i < iters; i++) {
			while(m) {
				rand = Math.floor(Math.random() * m--);
				[this.cards[m], this.cards[rand]] = [this.cards[rand],this.cards[m]];
			}
		}
		// this.cards.unshift(new DevCard ("Monopoly")); // FOR DEBUGGING
	}
}

class DevCard {
	constructor(name) {
		this.name = name;
		this.been_used = false;
	}
	setupForClick() {
		let img = this.element;
		var obj = this;
		img.addEventListener("click", function (e) {
			gameState.registerClick(e, obj);
		});
	}
	beenUsed() {
		return this.been_used;
	}
}

class Resource {
	constructor(resource) {
		this.resource = resource;
	}
}

class GameState {
	constructor() {
		this.players = [];
		this.playerAssets = {};
		this.roadPlayer = {};
		this.resource_names = RESOURCE_NAMES;
		this.table = new Table();

		let no_players = PLAYER_COLOURS.length;
		for (var i=0; i < no_players; i++) {
			let colour = PLAYER_COLOURS[i];
			this.players.push(new Player(colour));
		}

		let rand = Math.floor(Math.random() * no_players);
		this.startingPlayer = this.players[rand];
		this.currentPlayer = this.startingPlayer;
		this.finished = false;
	}

	initialise() {
		this.phase = new PlaceVillage(this.currentPlayer);
		this.table.initialise();
		this.addBaseEventListeners();
	}

	addBaseEventListeners() {
		this.table.addBaseEventListeners(this);
	}
	registerClick(e, obj) {
		this.phase.actionClick(e, obj);
	}
	nextPlayer() {
		let current_ind = this.players.indexOf(this.currentPlayer);
		let next_player = this.players[(((current_ind + 1) % NO_PLAYERS) + NO_PLAYERS) % NO_PLAYERS];
		this.currentPlayer = next_player;

		let player_flag = document.getElementById(DISPLAY_PLAYER_FLAG_ID);
		player_flag.innerHTML = this.currentPlayer.colour;
		player_flag.style.color = this.currentPlayer.colour;
		gameState.table.setView(this.currentPlayer.number);
	}
	simulate(state_strs) {
		let corner, mapping_obj, corner_obj, corners, rand_ind;
		for (let state_str of state_strs) {
			if (state_str == "village placement") {
				corners = document.getElementById(CORNER_MARKER_DIV_ID).children;
				let line, lines = this.table.lines;
				for (let i = 0; i < PLAYER_COLOURS.length*2; i++) {
					do {
						rand_ind = Math.floor(Math.random() * corners.length);
						mapping_obj = this.table.ct_mapping[rand_ind];
						corner_obj = mapping_obj['tiles'][0].corners[mapping_obj['corner_inds'][0]];
					}
					while (corner_obj.settlement.hasOwnProperty('player') || this.phase.isAdjacentSettlement(mapping_obj['tiles'], mapping_obj['corner_inds']));
					corners[rand_ind].click();

					do {
						rand_ind = Math.floor(Math.random() * lines.length);
						line = lines[rand_ind];
					}
					while (line.isRoad());
					line.element.click();
				}
			}
			if (state_str == "give resources") {
				let qty_resources = 4; //FOR DEBUGGING CHANGE AMOUNT OWN

				let head_tile, head_corner;
				for (let i = 0; i < qty_resources/2; i++) {
					for (let resource of this.resource_names) {
						for (let mapping_obj of this.table.ct_mapping) {
							head_tile = mapping_obj['tiles'][0];
							head_corner = head_tile.corners[mapping_obj['corner_inds'][0]];
							if (head_corner.settlement.hasOwnProperty('player')) {
								head_corner.settlement.grantResource(resource)
							}
						}
					}
				}
			}
		}
	}
	updateAssets() {
		let {players} = this;
		let asset_names = ["Road", "Village", "City", "Knight"];

		let player;
		for (let player of players) {
			for (let name of asset_names) {
				player.assets[name] = 0;
			}
		}

		let {lines}  = this.table;
		for (let line of lines) {
			if (line.isRoad()) {
				player = line.player;
				player.assets["Road"]++;
			}
		}

		let {ct_mapping} = this.table;
		let corners = [];
		for (let mapping_obj of ct_mapping) {
			corners.push(mapping_obj['tiles'][0].corners[mapping_obj['corner_inds'][0]]);
		}
		for (let corner of corners) {
			if (corner.hasSettlement()) {
				corner.settlement.player.assets[corner.settlement.constructor.name] += 1;
			}
		}

		let devCards;
		for (let player of players) {
			devCards = player.devCards;
			for (let devCard of devCards) {
				if (devCard.name == "Knight" && devCard.beenUsed()) {
					player.assets['Knight'] += 1;
				} 
			}
		}

		for (let name of asset_names) {
			this.playerAssets[name] = [];
			for (let player of players) {
				this.playerAssets[name].push(player.assets[name]);
			}
		}
	}

	countVPs() {
		let {playerAssets} = this;
		let {players} = this;

		let devCards, lines, max_road_length = 0;
		for (let player of players) {
			devCards = player.devCards;
			player.VPs = 0;

			for (let devCard of devCards) {
				if (devCard.name == "VP" && devCard.beenUsed()) {
					player.VPs += 1;
				}
			}

			lines = player.identifyLinesOwned(this.table.lines);
			player.maxRoad = this.calcMaxRoadLength(lines);
			if (player.maxRoad >= 5) {
				if (this.roadPlayer.hasOwnProperty("colour")) {
					if (player.maxRoad > this.roadPlayer.maxRoad) {
						this.roadPlayer = player;
					}
				} else {
					this.roadPlayer = player;
				}
			}
		}

		if (this.roadPlayer.hasOwnProperty("colour")) {
			this.roadPlayer.VPs += 2;
		}


		// let roadAssets = playerAssets["Road"];
		// let max_roads = Math.max(...roadAssets);
		// if (max_roads >= 5) {
		// 	let road_player = players[roadAssets.indexOf(max_roads)];
		// 	road_player.VPs += 2;
		// }

		let knightAssets = playerAssets["Knight"];
		let max_knights = Math.max(...knightAssets);
		if (max_knights >= 3) {
			let knight_player = players[knightAssets.indexOf(max_knights)];
			knight_player.VPs += 2;
		}

		let VPs = Array(players.length);
		VPs.fill(0);
		let player;
		for (let i = 0; i < players.length; i++) {
			player = players[i];
			player.VPs += playerAssets["Village"][i] * 1 + playerAssets["City"][i] * 2;
			VPs[i] = player.VPs;
		}
		this.VPs = VPs;
	}
	calcMaxRoadLength(lines) {
		let link_points, linked_lines, max_path_length, path_lengths =[], other_lines;
		for (let [index, line] of lines.entries()) {
			other_lines = Array.from(lines);
			other_lines.splice(index,1);
			max_path_length = 1;

			[linked_lines, link_points] = line.identifyConsecutiveLines(other_lines, [0.3333334, 0.3333334]);
			max_path_length = this.recurseForMaxPathLength(other_lines, linked_lines, link_points, max_path_length);
			path_lengths.push(max_path_length);
		}
		if (path_lengths.length) {
			max_path_length = Math.max(...path_lengths);
		}
		return max_path_length;
	}

	recurseForMaxPathLength(remain_lines, lines, link_points, orig_max_path_length) {
		if (lines.length) {
			orig_max_path_length++;

			let new_rem_lines, new_link_points, prev_link_point, other_lines, linked_lines, line, max_path_lengths = [];
			let max_path_length;
			for (let i = lines.length - 1; i >= 0; i--) {
				max_path_length = orig_max_path_length;
				line = lines[i];
				prev_link_point = link_points[i];
				other_lines = Array.from(remain_lines);
				other_lines.splice(remain_lines.indexOf(line),1);
				new_rem_lines = Array.from(remain_lines);
				if (new_rem_lines.length > 1) {
					new_rem_lines.splice(new_rem_lines.indexOf(line), 1);
				} else {
					new_rem_lines = [];
				}
				
				
				[linked_lines, new_link_points] = line.identifyConsecutiveLines(other_lines, prev_link_point);
				max_path_length = this.recurseForMaxPathLength(new_rem_lines, linked_lines, new_link_points, max_path_length);
				max_path_lengths.push(max_path_length);
			}
			max_path_length = Math.max(...max_path_lengths);
			return max_path_length;
		} else {
			return orig_max_path_length;
		}
	}

	testVPs() {
		let {VPs} = this;
		let max_VPs = Math.max(...VPs);
		if (max_VPs >= 10) {
			this.finished = true;
			this.winningPlayer = this.players[VPs.indexOf(max_VPs)];
		}
	}
}

var HTML_STATE = "./html_state.txt";
function saveHtmlState() {
	let fp = HTML_STATE;

}

var gameState = new GameState();
gameState.initialise();
// gameState.simulate(["village placement" , "give resources"]);

