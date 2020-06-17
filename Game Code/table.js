class Table {
	constructor() {
		this.tile_container = document.getElementById(TILE_CONTAINER_ID);
		let left_div = document.getElementById(LEFT_PANEL_ID);
		let right_div = document.getElementById(RIGHT_PANEL_ID);
		this.leftPanel = new LeftPanel(left_div);

		this.rightPanel = new RightPanel(right_div);
		this.tiles = [];
		this.corners = [];
		this.deck = new Deck();
		this.resource_names = RESOURCE_NAMES;
	}
	initialise() {
		this.initialiseTiles();
		this.randomiseTileResources();
		this.randomiseTileNumbers();
		this.displayTileNumbers();
		this.initialiseCornerClickDisplay();
		this.initialiseRoadClickDisplay();
		this.mapCornersToTiles();

		let x_left, x_right;
		[x_left, x_right] = this.identifyTileBoundaries();
		this.initialisePanels(x_left, x_right);
		this.leftPanel.initialiseDiceImages();
		this.leftPanel.initialiseWindowDisplay();
	}
	initialiseTiles() {
        let hex_formation = HEX_TILE_FORMATION;
		let hex_width = HEX_TILE_WIDTH;
		let hex_height = HEX_TILE_HEIGHT;
		let hex_coords = this.generateHexagonCoords(hex_width, hex_height, hex_formation);
		let {tile_container} = this;
		let centre_x, centre_y, centre_point, img, tile, tile_div;
		let tiles = HEX_TILE_FORMATION.slice();
		for (let i = 0; i < tiles.length; i++) {
			tiles[i] = [];
		}

		for (let i = 0; i < hex_formation.length; i++) {
			for (let j=0; j < hex_formation[i]; j++) {
				centre_x = hex_coords[i][j][0];
                centre_y = hex_coords[i][j][1];
                tile_div = document.createElement("div");
                tile_container.appendChild(tile_div);
				img = document.createElement("img");
                tile_div.appendChild(img);
                tile_div.style.position = 'absolute';
                tile_div.style.top = centre_y;
                tile_div.style.left = centre_x;
                tile_div.classList.add(TILE_DIV_CLASS);
				img.style.width = hex_width;
				img.style.height = hex_height;
				img.style.position = 'absolute';
				img.style.left = -hex_width/2;
				img.style.top= -hex_height/2;
				img.id = "tile row" + i.toString() + " col" + j.toString();
				tile_div.id = "tile_continer row" + i.toString() + " col" + j.toString();
				tile = new Tile(img, tile_div, i, j);
				tile.initialise();
				tiles[i].push(tile);
			}
		}
		this.tiles = tiles;
    }

    initialiseCornerClickDisplay() {
		let corners = [], cx, cy;
		let absolute_corners;
		let hash = {};

		for (let row of this.tiles) {
			for (let tile of row) {
				[cx, cy] = [parseFloat(tile.container.style.left, 10), parseFloat(tile.container.style.top, 10)];
				absolute_corners = tile.corner_values.map(function (value) {
					 return [cx + value[0], cy + value[1]]; 
					});
				corners = corners.concat(absolute_corners);
			}
		}
        for (let i = 0; i < corners.length; i++) {
			hash[corners[i]] = i;
		}
        let unique_corners = corners.filter(function (value, index) { 
			return hash[value] === index }
			);
		this.corners = unique_corners;
			
        let corner, canvas, ctx;
		let circ_r = CORNER_CLICK_DISPLAY_CIRCLE_R;
		let corner_marker_div = document.getElementById(CORNER_MARKER_DIV_ID);
        for (let i = 0; i < unique_corners.length; i++) {
			corner = unique_corners[i];
            cx = corner[0];
            cy = corner[1];
			canvas = document.createElement("canvas");
			canvas.classList.add("circle_marker");
			canvas.id = "marker" + i.toString();
			canvas.width = circ_r*2;
			canvas.height = circ_r*2;
			canvas.style.top = cy - circ_r;
			canvas.style.left = cx - circ_r;
			corner_marker_div.appendChild(canvas);
            ctx = canvas.getContext("2d");
            ctx.beginPath();
            ctx.arc(circ_r,circ_r,circ_r-2,0,2*Math.PI);
            ctx.stroke();
        }
	}

	initialiseRoadClickDisplay() {
		let lines = [];
		let hash = {};
		let corners, corner_a, corner_b, line_ind = 0, absolute_coords, absolute_coords2, line_coords, origin_x, origin_y;
		let tile_container;
		for (let row of this.tiles) {
			for (let tile of row) {
				corners = tile.corners;
				tile_container = tile.container;

				for (let i = 0; i < corners.length; i++) {
					corner_a = corners[i];
					corner_b = corners[(i+1)%corners.length];
					origin_x = parseFloat(tile.container.style.left, 10);
					origin_y = parseFloat(tile.container.style.top, 10);
					line_coords = [[corner_a.x, corner_a.y], [corner_b.x, corner_b.y]];
					absolute_coords = [[origin_x + corner_a.x, origin_y + corner_a.y], [origin_x + corner_b.x, origin_y + corner_b.y]];
					absolute_coords2 = [[origin_x + corner_b.x, origin_y + corner_b.y], [origin_x + corner_a.x, origin_y + corner_a.y]];
					if (hash[absolute_coords] == undefined && hash[absolute_coords2] == undefined) {
						lines.push(new Line(line_coords, tile));
						hash[absolute_coords] = line_ind;
						line_ind++;
					} else {
						if (!hash[absolute_coords] == undefined) {
							lines[hash[absolute_coords]].appendTile(tile);
						} else if (!hash[absolute_coords2] == undefined) {
							lines[hash[absolute_coords2]].appendTile(tile);
						}
					}
				}
			}
		}
		
		this.lines = lines;

		function generateLine(point1, point2) {
			return [point1,point2];
		}
	}
	
	mapCornersToTiles() {
		let {corners} = this;
		let hash = {};
		for (let i = 0; i < corners.length; i++) {
			hash[corners[i]] = i;
		}

		let {tiles} = this;
		let ct_mapping = Array(corners.length);
		for (var i = 0; i <ct_mapping.length; i++) {
			ct_mapping[i] = {'tiles': [],
								'corner_inds': []};
		}

		let marker_div = document.getElementById(CORNER_MARKER_DIV_ID);
		let marker_els = marker_div.children;
		let tile_corner, tile_corners, cx, cy, ind;
		let map_obj = {};
		for (let row of tiles) {
			for (let tile of row) {
				[cx, cy] = [parseFloat(tile.container.style.left, 10), parseFloat(tile.container.style.top, 10)];
				tile_corners = tile.corner_values.map(function (value) {
					 return [cx + value[0], cy + value[1]]; 
					});
				for (let i = 0; i < tile_corners.length; i++) {
					tile_corner = tile_corners[i];
					if (hash.hasOwnProperty(tile_corner)) {
						ind = hash[tile_corner];
						ct_mapping[ind]['tiles'].push(tile);
						ct_mapping[ind]['corner_inds'].push(i);
						tile.corners[i].setMarker(marker_els[ind]);
					}
				}
			}
		}
		this.ct_mapping = ct_mapping;
	}
	
	generateHexagonCoords(hex_width, hex_height, hex_formation) {
		let hex_coords = [];
		
		let y = 0.5*hex_height;
		for (var i = 0; i <hex_formation.length; i++) {
			let col_no = hex_formation[i];
			let x = -0.5*col_no*hex_width + hex_width/2;
			hex_coords.push([]);
			hex_coords[i].push([x,y]);

			for (var j = 0; j < col_no - 1; j++) {
				x += hex_width;
				hex_coords[i].push([x,y]);
			}

			y += hex_height/2 + hex_height/4;
		}
		return hex_coords;
	}
	randomiseTileResources() {
		let {tiles} = this;
		let {resource_names} = this;
		let res_ind, rand_resource;
		for (let row of tiles) {
			for (let tile of row) {
				res_ind =Math.floor(Math.random() * resource_names.length);
				rand_resource = resource_names[res_ind];
				tile.setResource(rand_resource);
			}
		}
	}
	randomiseTileNumbers() {
		let {tiles} = this;
		let rand_number;
		for (let row of tiles) {
			for (let tile of row) {
				do {
					rand_number = Math.ceil(Math.random() * 12);
				}
				while (rand_number == 1 || rand_number == 7);
				tile.number = rand_number;
			}
		}
	}
	displayTileNumbers() {
		let no_label;
		for (let row of this.tiles) {
			for (let tile of row) {
				no_label = document.createElement("p");
				no_label.classList.add("no_label");
				tile.container.appendChild(no_label);
				no_label.innerHTML = tile.number.toString();
			}
		}
	}
	identifyTileBoundaries() {
		let divs = document.querySelectorAll("." + TILE_DIV_CLASS);
		let tile_width = divs[0].firstChild.width;
		let x_left = parseInt(divs[0].style.left, 10) - tile_width, x_right = 0;
		let x1, x2;
		for (let div of divs) {
			x1 = parseInt(div.style.left, 10) - tile_width/2;
			x2 = x1 + tile_width;
			x_left = Math.min(x1, x_left);
			x_right = Math.max(x2, x_right);
		}
		return [x_left, x_right];
	}
	initialisePanels(x_left, x_right) {
		x_right = Math.ceil(x_right + document.documentElement.clientWidth*0.70);
		x_left = Math.floor(x_left + document.documentElement.clientWidth*0.70);

		let {leftPanel} = this;
		let {rightPanel} = this;

		let x1 = 0, y1 = 0, width = x_left, height = "100%";
		leftPanel.initialiseDiv(x1, y1, width, height);
		x1 = x_right, y1 = 0, width = document.documentElement.clientWidth - x_right, height = "100%";
		rightPanel.initialiseDiv(x1, y1, width, height);
	}

	removeRobber() {
		let {tiles} = this;
		for (let row of tiles) {
			for (let tile of row) {
				if (tile.hasRobber()) {
					tile.removeRobber();
				}
			}
		}
	}

	addBaseEventListeners(gameState) {
		// let containers = document.getElementsByClassName(RES_CARD_CONTAINER_CLASS);
		// var table = this;
		// for (let container of containers) {
		// 	container.addEventListener("mousemove", function(e) {
		// 		let active_container = document.getElementById(RES_CARD_CONTAINER_ID_HEAD + table.playerViewNo.toString());
		// 		let imgs = active_container.children;
	
		// 		let click_x = e.offsetX;
		// 		let rel_x = click_x + parseInt(e.target.style.left, 10);
		// 		rel_x = Math.min(rel_x, imgs.length*DISPLAYED_RES_CARD_OFFSET - 1);
		// 		let img_ind = Math.floor(rel_x/DISPLAYED_RES_CARD_OFFSET);
				
		// 		let img;
		// 		for (let i = 0; i < imgs.length; i++) {
		// 			imgs[i].style.zIndex = i; 
		// 		}
		// 		if (imgs.length) {
		// 			imgs[img_ind].style.zIndex = 99;
		// 		}
		// 	});
		// 	container.addEventListener("mouseout", function(e) {
		// 		let active_container = document.getElementById(RES_CARD_CONTAINER_ID_HEAD + table.playerViewNo.toString());
		// 		let imgs = active_container.children;
				
		// 		for (let i = 0; i < imgs.length; i++) {
		// 			imgs[i].style.zIndex = i;
		// 		}
		// 	});
		// }
		

		for (let row of this.tiles) {
			for (let tile of row) {
				tile.element.addEventListener("click", function (e) { gameState.registerClick(e, tile); });
			}
		}
		let button = document.getElementById(DICE_ROLL_BUTTON_ID);
		button.addEventListener("click", function (e) { gameState.registerClick(e, {}); });
		let click_markers = document.getElementById(CORNER_MARKER_DIV_ID).children;
		for (let marker of click_markers) {
			marker.addEventListener("click", function (e) { gameState.registerClick(e, {}); });
		}

		let shop_window_buttons = document.querySelectorAll("#" + SHOP_WINDOW_DISPLAY_ID + " button");
		for (let button of shop_window_buttons) {
			button.addEventListener("click", function (e) { gameState.registerClick(e, {}); })
		}

		let res_select_buttons = document.getElementsByClassName(RES_SELECT_BUTTON_CLASS);
		for (let button of res_select_buttons) {
			button.addEventListener("click", function (e) { gameState.registerClick(e, {}); });
		}

		let player_buttons = document.getElementsByClassName(PLAYER_BUTTON_CLASS);
		for (let button of player_buttons) {
			button.addEventListener("click", function (e) { gameState.registerClick(e, {}); });
		}

		var lines = this.lines;
		let line, element;
		for (let i = 0; i < lines.length; i++) {
			line = lines[i];
			element = line.element;
			element.addEventListener("click", function (e) {
				 gameState.registerClick(e, lines[i]);
				 });
		}

		let line_img;
		for (let i = 0; i < lines.length; i++) {
			line = lines[i];
			line_img = line.img;
			line_img.addEventListener("click", function (e) {
				 gameState.registerClick(e, lines[i]);
				 });
		}

		var tiles = this.tiles.reduce(function(y, x) {
			return y.concat(x);
		});
		let tile;
		for (let i =0; i < tiles.length; i++) {
			tile = tiles[i];
			element = tile.element;
			element.addEventListener("click", function (e) {
				gameState.registerClick(e, tiles[i]);
			});
		}

		let display_select_buttons = document.getElementsByClassName(SELECT_DISPLAY_BUTTON_CLASS);
		for (let button of display_select_buttons) {
			button.addEventListener("click", function (e) { 
				gameState.registerClick(e, {}); 
			});
		}

		let action_buttons = document.getElementsByClassName(ACTION_BUTTON_CLASS); {
			for (let button of action_buttons) {
				button.addEventListener("click", function(e) { gameState.registerClick(e,{}) });
			}
		}
	}
	setView(player_no) {
		// this.playerViewNo = player_no;
		// let res_card_display = document.getElementById(RES_CARD_DISPLAY_ID);
		// res_card_display.style.display = "block";
		// let player_ind = player_no - 1;
		// let card_containers = this.leftPanel.res_card_containers;
		// let card_container;
		// for (let i = 0; i < card_containers.length; i++) {
		// 	card_container = card_containers[i];
		// 	if (i == player_ind) {
		// 		card_container.style.display = "block";
		// 	} else {
		// 		card_container.style.display = "none";
		// 	}
		// }

		// let dev_card_display = document.getElementById(DEV_CARD_DISPLAY_ID);
		// dev_card_display.style.display = "none";
		// card_containers = this.leftPanel.dev_card_containers;
		// card_container;
		// for (let i = 0; i < card_containers.length; i++) {
		// 	card_container = card_containers[i];
		// 	if (i == player_ind) {
		// 		card_container.style.display = "block";
		// 	} else {
		// 		card_container.style.display = "none";
		// 	}
		// }
	}
}

class Panel {
	constructor(element) {
		this.element = element;
		this.id = element.id;
	}
	initialiseDiv(x1, y1, width, height) {
		this.element.style.position = 'absolute';

		this.element.style.left = x1;
		this.element.style.top = y1;

		this.element.style.width = width;
		this.element.style.height = height;
	}
}

class LeftPanel extends Panel {
	constructor(element) {
		super(element);
		this.dice_display = document.getElementById(DICE_DISPLAY_DIV_ID);
		this.res_card_displays = document.getElementsByClassName(RES_CARD_DISPLAY_CLASS);
		this.dev_card_displays = document.getElementsByClassName(DEV_CARD_DISPLAY_CLASS);
		this.shop_window = document.getElementById(SHOP_WINDOW_DISPLAY_ID);
		this.trade_window = document.getElementById(RES_SELECT_CONTAINER_ID);
		this.action_window = document.getElementById(ACTION_WINDOW_DISPLAY_ID);
		this.dice_button = document.getElementById(DICE_ROLL_BUTTON_ID);

		this.res_card_containers = [];
		for (let i=0; i < PLAYER_COLOURS.length; i++) {
			this.res_card_containers.push(document.getElementById(RES_CARD_CONTAINER_ID_HEAD + (i+1).toString()));
		}

		this.dev_card_containers = [];
		for (let i=0; i < PLAYER_COLOURS.length; i++) {
			this.dev_card_containers.push(document.getElementById(DEV_CARD_CONTAINER_ID_HEAD + (i+1).toString()));
		}
	}
	displayDiceRollingSubpanel(setting) {
		if (setting) {
			this.dice_display.style.display = "block";
		} else {
			this.dice_display.style.display = "none";
		}
	}
	displayDiceRollingButton(setting) {
		if (setting) {
			this.dice_button.style.display = "block";
		} else {
			this.dice_button.style.display = "none";
		}
	}
	displayShopWindow(setting) {
		if (setting) {
			this.shop_window.style.display = "block";
		} else {
			this.shop_window.style.display = "none";
		}
	}

	displayTradeWindow(setting) {
		if (setting) {
			this.trade_window.style.display = "block";
		} else {
			this.trade_window.style.display = "none";
		}
	}

	displayActionWindow(setting) {
		if (setting) {
			this.action_window.style.display = "block";
		} else {
			this.action_window.style.display = "none";
		}
	}

	displayResCards(setting) {
		let player_no = gameState.currentPlayer.number;
		let card_display = this.res_card_displays[player_no - 1];
		if (setting) {
			card_display.style.display = "block";
		} else {
			card_display.style.display = "none";
		}
	}

	displayDevCards(setting) {
		let player_no = gameState.currentPlayer.number;
		let card_display = this.dev_card_displays[player_no - 1];
		if (setting) {
			card_display.style.display = "block";
		} else {
			card_display.style.display = "none";
		}
	}

	addResCardToDisplay(resCard, player_no) {
		let card_container = this.res_card_containers[player_no - 1];
		let card_im = document.createElement("img");
		var leftPanel = this;
		card_im.classList.add(DISPLAYED_RES_CARD_CLASS);
		card_container.appendChild(card_im);
		let im_filepath = FILEPATH_HEAD + FILEPATH_SECTION_RES_CARD + resCard.resource + ".png";
		card_im.src = im_filepath;
		let card_offset = DISPLAYED_RES_CARD_OFFSET;
		let this_offset  = card_offset*(card_container.children.length - 1);
		card_container.style.left =  -this_offset/2;
		card_im.style.left = this_offset;
		return card_im;
	}

	addDevCardToDisplay(devCard, player_no) {
		let card_container = this.dev_card_containers[player_no - 1];
		let card_im = document.createElement("img");
		devCard.element = card_im;
		card_container.appendChild(card_im);

		card_im.id =  "player" + player_no.toString() + " dev_card"+ card_container.children.length.toString();
		card_im.classList.add(DISPLAYED_DEV_CARD_CLASS);
		
		let im_filepath = FILEPATH_HEAD + FILEPATH_SECTION_DEV_CARD + devCard.name + ".png";
		card_im.src = im_filepath;
		let card_offset = DISPLAYED_DEV_CARD_OFFSET;
		let this_offset  = card_offset*(card_container.children.length - 1);
		card_container.style.left =  -this_offset/2;
		card_im.style.left = this_offset;
	}

	updateDiceImage(roll_value, dice_no) {
		let dice_im = document.getElementById(DICE_ROLL_IMAGE_ID + dice_no.toString());
		let im_filepath = FILEPATH_HEAD + FILEPATH_SECTION_GAME_PIECE + "Dice/Dice_" + roll_value.toString() + ".png";
		dice_im.src = im_filepath;
	}

	initialiseDiceImages() {
		let roll_value1 = Math.ceil(Math.random() * 6);
		let roll_value2 = Math.ceil(Math.random() * 6);

		this.updateDiceImage(roll_value1,1);
		this.updateDiceImage(roll_value2,2);
	}

	initialiseWindowDisplay() {
		this.displayDiceRollingButton(false);
		this.displayActionWindow(false);
		this.displayTradeWindow(false);
		this.displayDiceRollingSubpanel(false);
		this.displayShopWindow(false);
	}
}

class RightPanel extends Panel {
	constructor(element) {
		super(element);
		this.player_button_container = document.getElementById(PLAYER_BUTTON_CONTAINER_ID);
		for (let [index, button] of Array.from(this.player_button_container.children).entries()) {
			button.innerHTML = PLAYER_COLOURS[index];
		}
	}
}