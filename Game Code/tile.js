class Line {
	constructor(line_coords, tile) {
		this.road = false;
		this.coords = line_coords;
		this.abs_coords = this.calcAbsoluteCoords(this.coords, tile.container);
		this.tiles = [];
		this.tiles.push(tile);
		this.createElement(tile.container);
	}

	calcAbsoluteCoords(rel_coords, container) {
		let cx = parseFloat(container.style.left, 10);
		let cy = parseFloat(container.style.top, 10);
		let coords = [[rel_coords[0][0] + cx, rel_coords[0][1] + cy], [rel_coords[1][0] + cx, rel_coords[1][1] + cy]]
		return coords;
	}

	createElement(tile_container) {
		let canvas, container;
		let ctx;

		container = document.createElement("div");
		canvas = document.createElement("canvas");

		tile_container.appendChild(container);
		container.appendChild(canvas);
		canvas.classList.add(LINE_MARKER_CLASS);
		container.classList.add(LINE_MARKER_CONTAINER_CLASS);

		let x1, y1, x2, y2;
		x1 = this.coords[0][0];
		y1 = this.coords[0][1];
		x2 = this.coords[1][0];
		y2 = this.coords[1][1];

		container.style.position = 'absolute';
		container.style.top = y1;
		container.style.left = x1;

		let translate_x, translate_y;
		if (x2 < x1) {
			translate_x = x2 - x1;
		} else if (x2 == x1) {
			translate_x = -LINE_MARKER_STROKE_WIDTH;
		} else {
			translate_x = 0;
		}

		if (y2 < y1) {
			translate_y = y2 - y1;
		} else if (y2 == y1) {
			translate_y = -LINE_MARKER_STROKE_WIDTH;
		} else {
			translate_y = 0;
		}

		canvas.style.position = 'absolute';
		canvas.style.top = translate_y;
		canvas.style.left = translate_x;


		let width = Math.max(x1, x2) - Math.min(x1, x2);
		let height = Math.max(y1, y2) - Math.min(y1, y2);

		canvas.width = Math.max(width,10);
		canvas.height = Math.max(height,10);

		ctx = canvas.getContext("2d");
		ctx.beginPath();
		ctx.lineWidth = LINE_MARKER_STROKE_WIDTH;

		this.startpoint = [-translate_x, -translate_y];
		ctx.moveTo(this.startpoint[0], this.startpoint[1]);
		
		this.endpoint = [(x2-x1)-translate_x, (y2-y1)-translate_y];
		ctx.lineTo(this.endpoint[0], this.endpoint[1]);
		ctx.stroke();

		let img = new Image();

		img.src = canvas.toDataURL();
		img.id = tile_container.id + " line coords: " + this.coords.toString();
		img.style.position = 'absolute';
		img.style.top = translate_y;
		img.style.left = translate_x;
		container.appendChild(img);

		this.context = ctx;
		this.element = canvas;
		this.container = container;
		this.img = img;
	}
	appendTile(tile) {
		this.tiles.push(tile);
	}
	setRoad(player) {
		this.road = true;
		this.player = player;

		let ctx = this.context;
		ctx.clearRect(0, 0, this.element.width, this.element.height);
		ctx.beginPath();
		ctx.moveTo(this.startpoint[0], this.startpoint[1]);
		ctx.lineTo(this.endpoint[0], this.endpoint[1]);
		ctx.strokeStyle = player.colour;
		ctx.lineWidth = ROAD_STROKE_WIDTH;
		ctx.stroke();
		this.img.src = this.element.toDataURL();
	}
	isRoad() {
		return this.road;
	}
	identifyConsecutiveLines(lines, link_point) {
		let next_link, linked_lines = [], link_points = [];

		let this_p1 = this.abs_coords[0];
		let this_p2 = this.abs_coords[1];

		let that_p1, that_p2;
		for (let line of lines) {
			that_p1 = line.abs_coords[0];
			that_p2 = line.abs_coords[1];

			if (!pointsEqual(that_p1, link_point) && !pointsEqual(that_p2, link_point)) {
				if (pointsEqual(this_p1, that_p1) || pointsEqual(this_p1, that_p2)) {
					next_link = this_p1;
					link_points.push(next_link);
					linked_lines.push(line);
				} else if (pointsEqual(this_p2, that_p1) || pointsEqual(this_p2, that_p2)) {
					next_link = this_p2;
					link_points.push(next_link);
					linked_lines.push(line);
				}
			}
		}

		return [linked_lines, link_points];

		function pointsEqual(point1, point2) {
			return (point1[0] == point2[0] && point1[1] == point2[1]);
		}
	}

	setLinkPoint(point) {
		this.linkPoint = point;
	}
}

class Tile {
	constructor(im_element, cont_element, i, j) {
		this.element = im_element;
		this.element.classList.add(TILE_IMAGE_CLASS);
		this.container = cont_element;
		this.row = i;
		this.col = j;
		this.settlement = -1;
		this.lines = [];
		this.robber = false;
	}
	initialise() {
		this.width = this.element.width;
		this.height = this.element.height;
		this.corner_values = this.calculateCorners();
		this.corners = this.generateCornerObjs(this.corner_values);
	}

	getSettlements() {
		let {corners} = this;
		let settlements = [];
		let settlement;
		for (let corner of corners) {
			settlement = corner.getSettlement();
			if (settlement.hasOwnProperty("player")) {
				settlements.push(settlement);
			}
		}
		return settlements;
	}

	setResource(resource) {
		this.resource = resource;
		var im_filepath = FILEPATH_HEAD + FILEPATH_SECTION_RESOURCE_HEX + resource + ".png";
		this.element.src = im_filepath;
	}
	
    calculateCorners() {
        let {width} = this;
        let {height} = this;
        
        let x1 = -width/2;
        let x2 = 0;
        let x3 = width/2;
        let y1 = height/4;
        let y2 = -height/4;
        let y3 = -height/2;
        let y4 = -height/4;
        let y5 = height/4;
        let y6 = height/2;
        
        let corners = [];
        corners.push([x1,y1]);
        corners.push([x1,y2]);
        corners.push([x2,y3]);
        corners.push([x3,y4]);
        corners.push([x3,y5]);
        corners.push([x2,y6]);

        return corners;
	}
	
	generateCornerObjs(corner_values) {
		let corner_objs = [];
		let corner;
		for (let corner_value of corner_values) {
			corner = new Corner();
			corner.initialise(corner_value[0], corner_value[1], this.container);
			corner_objs.push(corner);
			
		}
		return corner_objs;
	}

	hasRobber() {
		return this.robber;
	}

	removeRobber() {
		this.robber = false;
		this.robber_im.parentNode.removeChild(this.robber_im);
		this.robber_im = null;
	}

	addRobber() {
		this.robber = true;
		this.addRobberIm();
	}

	addRobberIm() {
		let img = document.createElement("img");
		this.container.appendChild(img);
		img.src = FILEPATH_HEAD + FILEPATH_SECTION_GAME_PIECE + "Robber.png";
		img.id = "robber";

		this.robber_im = img;
	}
}

class Corner {
	constructor() {
		this.settlement = new Object();
	}

	initialise(x, y, tile_container) {
		this.x = x;
		this.y = y;
		let container = document.createElement("div");
		container.classList.add(CORNER_OBJ_CONTAINER);
		container.style.position = "absolute";
		container.style.top = y;
		container.style.left = x;
		tile_container.appendChild(container);
		this.container = container;
	}

	getCoords() {
		return [x, y];
	}
	setMarker(marker) {
		this.marker = marker;
	}

	setSettlement(player, type) {
		if (type == "Village") {
			this.settlement = new Village(this.container, player);
		} else if (type == "City") {
			this.settlement = new City(this.container, player);
		}
	}
	
	getSettlement() {
		return this.settlement;
	}

	hasSettlement() {
		return this.settlement.hasOwnProperty("player");
	}
}

class Settlement {
	constructor(container,player) {
		this.container = container;
		this.player = player;
	}
	setImage() {
		let element = document.createElement("img");
		this.container.appendChild(element);
		this.element = element;
		
		this.element.classList.add("settlement");
		
		let im_filepath = FILEPATH_HEAD + FILEPATH_SECTION_GAME_PIECE + this.type + "_" + this.player.colour + ".png";
		this.element.src = im_filepath;
		this.setRect(this.im_width, this.im_height);
	}
	deleteImage() {
		this.element.parentNode.removeChild(this.element);
	}

	setRect(width, height) {
		this.element.style.width = width;
		this.element.style.height = height;
		this.element.style.left = -width/2;
		this.element.style.top = -height/2;
	}
}

class City extends Settlement {
	constructor(container, player) {
		super(container, player);
		this.type = "City";

		this.im_width = BUILDING_CITY_IM_WIDTH;
		this.im_height = BUILDING_CITY_IM_HEIGHT;
	}

	grantResource(resource) {
		let qty = CITY_RESOURCE_INCREMENT;
		this.player.receiveResource(resource, qty);
	}
}

class Village extends Settlement {
	constructor(container, player) {
		super(container,player);
		this.type = "Village";

		this.im_width = BUILDING_SETTLEMENT_IM_WIDTH;
		this.im_height = BUILDING_SETTLEMENT_IM_HEIGHT;
	}

	grantResource(resource) {
		let qty = VILLAGE_RESOURCE_INCREMENT;
		this.player.receiveResource(resource, qty);
	}
}