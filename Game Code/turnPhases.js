class Phase {
	constructor(player) {
		this.change_req = false;
		this.startingPlayer = player;
		let player_flag = document.getElementById(DISPLAY_PLAYER_FLAG_ID);
		player_flag.innerHTML = this.startingPlayer.colour;
		player_flag.style.color = this.startingPlayer.colour;
		this.doubleAction = false;

		this.displayPanel = gameState.table.leftPanel;
		// sendUpdatedPage();
	}
	changeRequired() {
		return this.change_req;
	}
	updatePhase() {
		gameState.updateAssets();
		gameState.countVPs();
		gameState.testVPs();
		if (gameState.finished) {
			console.log("Game finished!");
			console.log(gameState.winningPlayer.colour + " won the game");
			this.change_req = false;
			gameState.phase = new DeclareWinner(gameState.winningPlayer);
		} else {
			this.change_req = true;
		}
	}
	actionClick(e, obj) {
		let {target} = e;
		if(target.parentElement.id == PLAYER_BUTTON_CONTAINER_ID) {
			let player_no = parseInt(target.id.substr(-1), 10);
			gameState.table.setView(player_no);
		}
		if (target.classList[0] == SELECT_DISPLAY_BUTTON_CLASS) {
			let button_id = target.id;
			let id_head = button_id.substr(0, button_id.length - 1);
			let id_tail = button_id[button_id.length - 1];
			let player_no = parseInt(id_tail, 10);

			if (id_head == "select_res_display") {
				gameState.table.leftPanel.res_card_displays[player_no - 1].style.display = "block";
				gameState.table.leftPanel.dev_card_displays[player_no - 1].style.display = "none";
			} else if (id_head == "select_dev_display") {
				gameState.table.leftPanel.res_card_displays[player_no - 1].style.display = "none";
				gameState.table.leftPanel.dev_card_displays[player_no - 1].style.display = "block";
			}
		}
	}

	isAdjacentSettlement(tiles, corner_inds) {
		let tile, corner, ind;
		let adj_corner1, adj_corner2;
		for (let i = 0; i < tiles.length; i++) {
			tile = tiles[i];
			ind = corner_inds[i];
			corner = tile.corners[ind];
			adj_corner1 = tile.corners[(((ind - 1) % 6) + 6) % 6];
			adj_corner2 = tile.corners[(((ind + 1) % 6) + 6) % 6];
			if (adj_corner1.settlement.hasOwnProperty("player") || adj_corner2.settlement.hasOwnProperty("player")) {
				return true;
			}
		}
		return false;
	}
}

class PlaceVillage extends Phase {
	constructor(player) {
		super(player);
		this.descriptor = "Settlement placement forwards";
		this.type = this.constructor.name;
	}
	actionClick(e, obj) {
		super.actionClick(e, obj);
		let target = e.target;
		if (target.parentElement.id == CORNER_MARKER_DIV_ID) {
			let player = gameState.currentPlayer;
			let marker = target;
			let marker_ind = parseInt(marker.id.replace( /^\D+/g, ''),10);

			let tiles = gameState.table.ct_mapping[marker_ind]['tiles'];
			let corner_inds = gameState.table.ct_mapping[marker_ind]['corner_inds'];
			
			let head_tile = tiles[0];
			let head_corner = head_tile.corners[corner_inds[0]];
			let corner, tile;

			if ((!head_corner.settlement.hasOwnProperty("player")) && !this.isAdjacentSettlement(tiles, corner_inds)) {
				head_corner.setSettlement(player, "Village");
				head_corner.settlement.setImage();
				for (let i = 1; i < tiles.length; i++) {
					tile = tiles[i];
					corner = tile.corners[corner_inds[i]];
					corner.setSettlement(player, "Village");
				}
				this.updatePhase();
				if (this.changeRequired()) {
					this.nextPhase();
					return;
				}
			}
		}
	}
	nextPhase() {
		gameState.phase = new PlaceRoad(gameState.currentPlayer);
	}
	nextPlayer() {
		gameState.nextPlayer();
	}
}

class PlaceVillageReverse extends PlaceVillage {
	constructor(player) {
		super(player);
		this.descriptor = "Settlement placement reversed";
		this.type = this.constructor.name;
	}
	nextPlayer() {
		let current_ind = gameState.players.indexOf(gameState.currentPlayer);
		let next_player = gameState.players[(((current_ind - 1) % NO_PLAYERS) + NO_PLAYERS) % NO_PLAYERS];
		gameState.currentPlayer = next_player;

		let player_flag = document.getElementById(DISPLAY_PLAYER_FLAG_ID);
		player_flag.innerHTML = next_player.colour;
		player_flag.style.color = next_player.colour;
	}
	nextPhase() {
		gameState.phase = new PlaceRoadReverse(gameState.currentPlayer);
	}
}

class PlaceRoad extends Phase {
	constructor(player) {
		super(player);
		this.descriptor = "Road placement";
		this.type = this.constructor.name;
	}

	actionClick(e, obj) {
		super.actionClick(e, obj);
		let target = e.target;
		if (target.parentElement.classList[0] == LINE_MARKER_CONTAINER_CLASS) {
			let line = obj;

			if (!line.isRoad()) {
				line.setRoad(gameState.currentPlayer);

				this.updatePhase();
				if (this.changeRequired()) {
					let player_ind = PLAYER_COLOURS.indexOf(gameState.currentPlayer.colour);
					this.nextPlayer();
					if (gameState.currentPlayer == gameState.startingPlayer) {
						let this_player = gameState.players[player_ind];
						gameState.currentPlayer = this_player;
						gameState.phase = new PlaceVillageReverse(gameState.currentPlayer);
						return;
					}

					gameState.phase = new PlaceVillage(gameState.currentPlayer);
					return;
				}
			}
		}
	}
	nextPlayer() {
		gameState.nextPlayer();
	}
}

class PlaceRoadReverse extends Phase {
	constructor(player) {
		super(player);
		this.descriptor = "Road placement in opposite order";
		this.type = this.constructor.name;
	}

	actionClick(e, obj) {
		super.actionClick(e, obj);
		let target = e.target;
		if (target.parentElement.classList[0] == LINE_MARKER_CONTAINER_CLASS) {
			let line = obj;

			if (!line.isRoad()) {
				line.setRoad(gameState.currentPlayer);

				this.updatePhase();
				if (this.changeRequired()) {
					if (gameState.currentPlayer == gameState.startingPlayer) {
						gameState.table.setView(gameState.currentPlayer.number);
						gameState.phase = new DiceRoll(gameState.currentPlayer);
						return;
					}
					this.nextPlayer();
					gameState.phase = new PlaceVillageReverse(gameState.currentPlayer);
					return;
				}
			}
		}
	}
	nextPlayer() {
		let current_ind = gameState.players.indexOf(gameState.currentPlayer);
		let next_player = gameState.players[(((current_ind - 1) % NO_PLAYERS) + NO_PLAYERS) % NO_PLAYERS];
		gameState.currentPlayer = next_player;

		let player_flag = document.getElementById(DISPLAY_PLAYER_FLAG_ID);
		player_flag.innerHTML = next_player.colour;
		player_flag.style.color = next_player.colour;
	}
}

class DiceRoll extends Phase {
	constructor(player) {
		super(player);
		this.descriptor = "Player dice roll";
		this.type = this.constructor.name;

		this.displayPanel.displayDiceRollingSubpanel(true);
		this.displayPanel.displayDiceRollingButton(true);
		this.displayPanel.displayShopWindow(false);
		this.displayPanel.displayActionWindow(false);
	}

	actionClick(e, obj) {
		super.actionClick(e, obj);
		let target = e.target;
		if (target.id == DICE_ROLL_BUTTON_ID) {
			let roll_value1 = Math.ceil(Math.random() * 6);
			let roll_value2 = Math.ceil(Math.random() * 6);
			// roll_value1 = 3;
			// roll_value2 = 4;

			this.displayPanel.updateDiceImage(roll_value1,1);
			this.displayPanel.updateDiceImage(roll_value2,2);
			let roll_total = roll_value1 + roll_value2;
			let active_tiles = this.identifyActiveTiles(roll_total);

			if (roll_total == 7) {
				gameState.phase = new PlaceRobber(gameState.currentPlayer);
				return;
			}

			let settlements;
			for (let tile of active_tiles) {
				if (!tile.hasRobber()) {
					settlements = tile.getSettlements();
					for (let settlement of settlements) {
						settlement.grantResource(tile.resource);
					}
				}
			}
			this.updatePhase();
			if (this.changeRequired()) {
				gameState.phase = new SpendCards(gameState.currentPlayer);
				return;
			}
		}
	}
	
	identifyActiveTiles(roll_total) {
		let tiles = [];
		for (let row of gameState.table.tiles) {
			for (let tile of row) {
				if (tile.number == roll_total) {
					tiles.push(tile);
				}
			}
		}
		return tiles;
	}
}

class PlaceRobber extends Phase {
	constructor(player) {
		super(player);
		this.descriptor = "Robber placement";
		this.type = this.constructor.name;

		this.displayPanel.displayDiceRollingButton(false);
		this.displayPanel.displayActionWindow(false);
		this.displayPanel.displayTradeWindow(false);
	}

	actionClick(e, obj) {
		super.actionClick(e, obj);
		let target = e.target;

		if (target.id.substr(0,4) == "tile") {
			let tile = obj;

			gameState.table.removeRobber();
			tile.addRobber();

			this.updatePhase();
			if (this.changeRequired()) {
				gameState.phase = new SpendCards(gameState.currentPlayer);
				return;
			}
		}
	}
}

class SpendCards extends Phase {
	constructor(player) {
		super(player);
		this.descriptor = "Player spending and acquisition";
		this.type = this.constructor.name;

		this.displayPanel.displayShopWindow(true);
		this.displayPanel.displayTradeWindow(false);
		this.displayPanel.displayDiceRollingButton(false);
		
		this.displayPanel.displayDiceRollingSubpanel(true);
		this.displayPanel.displayActionWindow(true);

		gameState.purchasing = null;
	}

	actionClick(e, obj) {
		super.actionClick(e, obj);
		let target = e.target;

		if (target.parentElement.id == ACTION_WINDOW_DISPLAY_ID) {
			if (target.id == "trade") {
				this.displayPanel.displayTradeWindow(true);
				this.displayPanel.displayShopWindow(false);
				this.displayPanel.displayDevCards(false);
				this.displayPanel.displayResCards(true);
			} else if (target.id == "buy") {
				this.displayPanel.displayTradeWindow(false);
				this.displayPanel.displayShopWindow(true);
				this.displayPanel.displayDevCards(false);
				this.displayPanel.displayResCards(true);
			} else if (target.id == "use_card") {
				this.displayPanel.displayDevCards(true);
				this.displayPanel.displayResCards(false);
				if (gameState.currentPlayer.hasUsableDevCard()) {
					gameState.phase = new UseDevCard(gameState.currentPlayer);
					return;
				}
			}
				else if (target.id == "finish") {
				this.updatePhase();
			}
		}

		if (target.parentElement.id == RES_SELECT_CONTAINER_ID) {
			for (let res_name of RESOURCE_NAMES) {
				if (target.id == res_name) {
					this.displayPanel.displayDevCards(false);
					this.displayPanel.displayResCards(true);
					if (gameState.currentPlayer.getResources()[res_name] >= 4) {
						gameState.currentPlayer.discardResource(res_name, 4);
					gameState.phase = new DrawResource(gameState.currentPlayer);
					}
				}
			}
		}

		if (target.parentElement.id == SHOP_WINDOW_DISPLAY_ID) {
			let purchase_successful = gameState.currentPlayer.attemptPurchase(target.id);
			if (purchase_successful) {
				gameState.purchasing = target.id;
				if (gameState.purchasing == SHOP_WINDOW_DEVCARD_ID) {
					gameState.table.leftPanel.displayDevCards(true);
					gameState.table.leftPanel.displayResCards(false);
					gameState.currentPlayer.drawDevCard(gameState.table.deck);
				} else {
					gameState.phase = new PlaceStructure(gameState.currentPlayer);
					return;
				}
			}
		}
			
		if (this.changeRequired()) {
			gameState.nextPlayer();
			gameState.phase = new DiceRoll(gameState.currentPlayer);
			return;
		}
	}
	nextStage() {
		this.change_req = true;
	}
	identifyActiveTiles(roll_total) {
		let tiles = [];
		for (let row of gameState.table.tiles) {
			for (let tile of row) {
				if (tile.number == roll_total) {
					tiles.push(tile);
				}
			}
		}
		return tiles;
	}
}

class PlaceStructure extends Phase {
	constructor(player) {
		super(player);
		this.descriptor = "Structure construction";
		this.type = this.constructor.name;

		this.displayPanel.displayActionWindow(false);
		this.displayPanel.displayTradeWindow(false);
		this.displayPanel.displayShopWindow(true);
	}

	actionClick(e, obj) {
		super.actionClick(e, obj);
		let target = e.target;

		if (target.parentElement.classList[0] == LINE_MARKER_CONTAINER_CLASS) {
			if (gameState.purchasing == SHOP_WINDOW_ROAD_ID) {
				let line = obj;

				if (!line.isRoad()) {
					line.setRoad(gameState.currentPlayer);
	
					this.updatePhase();
					if (this.changeRequired()) {
						if (this.doubleAction) {
							gameState.phase = new PlaceStructure(gameState.currentPlayer);
							return;
						} else {
							gameState.phase = new SpendCards(gameState.currentPlayer);
							return;
						}
					}
				}
			}
		}

		if (target.parentElement.id == CORNER_MARKER_DIV_ID) {
			let player = gameState.currentPlayer;
			let marker = target;
			let marker_ind = parseInt(marker.id.replace( /^\D+/g, ''),10);

			let tiles = gameState.table.ct_mapping[marker_ind]['tiles'];
			let corner_inds = gameState.table.ct_mapping[marker_ind]['corner_inds'];
			
			let head_tile = tiles[0];
			let head_corner = head_tile.corners[corner_inds[0]];
			let corner, tile;

			let settlement_str, valid_construction = false;
			if (gameState.purchasing == SHOP_WINDOW_SETTLEMENT_ID) {
				settlement_str = "Village";
				if ((!head_corner.settlement.hasOwnProperty("player")) && !this.isAdjacentSettlement(tiles, corner_inds)) {
					valid_construction = true;
				} 
			} else if (gameState.purchasing == SHOP_WINDOW_CITY_ID) {
				settlement_str = "City";
				if ((head_corner.settlement.hasOwnProperty("player")) && head_corner.settlement.player == gameState.currentPlayer && head_corner.settlement.type == "Village") {
					valid_construction = true;
					head_corner.settlement.deleteImage();
				}
			}

			if (valid_construction) {
				for (let i = 0; i < tiles.length; i++) {
					tile = tiles[i];
					corner = tile.corners[corner_inds[i]];
					corner.setSettlement(player, settlement_str);
				}
				head_corner.settlement.setImage();

				this.updatePhase();
				if (this.changeRequired()) {
					gameState.phase = new SpendCards(gameState.currentPlayer);
					return;
				}
			}
		}
	}
}

class UseDevCard extends Phase {
	constructor(player) {
		super(player);
		this.descriptor = "Use dev card";
		this.type = this.constructor.name;

		this.displayPanel.displayActionWindow(false);
		this.displayPanel.displayTradeWindow(false);
		this.displayPanel.displayShopWindow(false);
		this.displayPanel.displayDevCards(true);
		this.displayPanel.displayResCards(false);
	}

	actionClick(e, obj) {
		if (obj.constructor.name == "DevCard") {
			let devCard = obj;
			let name = devCard.name;
			if (!devCard.been_used) {
				if (name == "Knight") {
					gameState.phase = new PlaceRobber(gameState.currentPlayer);
				} else if (name == "VP") {
					gameState.phase = new SpendCards(gameState.currentPlayer);
				} else if (name == "Road") {
					gameState.purchasing = SHOP_WINDOW_ROAD_ID;
					gameState.phase = new PlaceStructure(gameState.currentPlayer);
					gameState.phase.doubleAction = true;
				} else if (name == "Plenty") {
					gameState.phase = new DrawResource(gameState.currentPlayer);
					gameState.phase.doubleAction = true;
				} else if (name == "Monopoly") {
					gameState.phase = new CollectResource(gameState.currentPlayer);
				} else {
					console.log("Dubious Dev Card Clicked");
				}
			} else {
				return;
			}

			devCard.been_used = true;
			devCard.element.style.opacity = 0.45;
		}
	}
}

class DrawResource extends Phase {
	constructor(player) {
		super(player);
		this.descriptor = "Use dev card";
		this.type = this.constructor.name;

		this.displayPanel.displayTradeWindow(true);
		this.displayPanel.displayShopWindow(false);
		this.displayPanel.displayActionWindow(false);
		this.displayPanel.displayDevCards(false);
		this.displayPanel.displayResCards(true);
	}
	actionClick(e, obj) {
		let {target} = e;

		if (target.parentElement.id == RES_SELECT_CONTAINER_ID) {
			this.displayPanel.displayDevCards(false);
			this.displayPanel.displayResCards(true);

			let button_id = target.id;
			let res_name = button_id;
			gameState.currentPlayer.receiveResource(res_name, 1);

			this.updatePhase();
			if (this.changeRequired()) {
				if (this.doubleAction) {
					gameState.phase = new DrawResource(gameState.currentPlayer);
					return;
				} else {
					gameState.phase = new SpendCards(gameState.currentPlayer);
					return;
				}
			}
		}
	}
}

class CollectResource extends Phase {
	constructor(player) {
		super(player);
		this.descriptor = "Use dev card";
		this.type = this.constructor.name;

		this.displayPanel.displayTradeWindow(true);
		this.displayPanel.displayShopWindow(false);
		this.displayPanel.displayActionWindow(false);
		this.displayPanel.displayDevCards(false);
		this.displayPanel.displayResCards(true);
	}
	actionClick(e, obj) {
		let {target} = e;

		if (target.parentElement.id == RES_SELECT_CONTAINER_ID) {
			
			let button_id = target.id;
			let res_name = button_id;
			
			let no_collected = 0;
			let resCards, resCard;
			for (let player of gameState.players) {
				if (player != gameState.currentPlayer) {
					resCards = player.resCards;
					for (let i = resCards.length -1; i >= 0; i--) {
						resCard = resCards[i];
						if (resCard.resource == res_name) {
							player.discardResCard(resCard);
							no_collected += 1;
						}
					}
				}
			}

			gameState.currentPlayer.receiveResource(res_name, no_collected);

			this.updatePhase();
			if (this.changeRequired()) {
				gameState.phase = new SpendCards(gameState.currentPlayer);
				return;
			}
		}
	}
}

class DeclareWinner extends Phase {
	constructor(winning_player) {
		super(winning_player);
		this.descriptor = "Game finished, declare winner";
		this.type = this.constructor.name;
	}

	actionClick(e, obj) {

	}
}