const RESOURCE_NAMES = ["Hay there", "Wood", "Rock", "Clay", "Sheep"];
const PURCHASE_ROAD_REQ_RESOURCES = {Hay: 0, Wood: 1, Rock: 0, Clay: 1, Sheep: 0};
const PURCHASE_SETTLEMENT_REQ_RESOURCES = {Hay: 1, Wood: 1, Rock: 0, Clay: 1, Sheep: 1};
const PURCHASE_CITY_REQ_RESOURCES = {Hay: 2, Wood: 0, Rock: 3, Clay: 0, Sheep: 0};
const PURCHASE_DEVCARD_REQ_RESOURCES = {Hay: 1, Wood: 0, Rock: 1, Clay: 0, Sheep: 1};
const FILEPATH_HEAD = "./";
const HEX_TILE_FORMATION = [3,4,5,4,3];
const DECK_CARD_NAMES = ["Knight", "VP", "Road", "Plenty", "Monopoly"];
const DEV_CARD_DECK_COMPOSITION = {Knight: 14, VP: 5, Road: 2, Plenty: 2, Monopoly: 2};
const HEX_TILE_WIDTH = 108;
const HEX_TILE_HEIGHT = 126;
const DISPLAYED_RES_CARD_OFFSET = 40;
const DISPLAYED_DEV_CARD_OFFSET = 130;
const BUILDING_SETTLEMENT_IM_WIDTH = 36;
const BUILDING_SETTLEMENT_IM_HEIGHT = 48;
const BUILDING_CITY_IM_WIDTH = 50;
const BUILDING_CITY_IM_HEIGHT = 50;
const CORNER_CLICK_DISPLAY_CIRCLE_R = 20;
const CORNER_MARKER_DIV_ID = "corner_marker_div";
const CORNER_OBJ_CONTAINER = "corner_obj_container";
const LINE_MARKER_CLASS = "line_marker";
const ROAD_MARKER_CLASS = "road_marker";
const LINE_MARKER_CONTAINER_CLASS = "line_marker_container";
const LINE_MARKER_STROKE_WIDTH = 3;
const ROAD_STROKE_WIDTH = 6;
const TILE_CONTAINER_ID = "tile_container";
const TILE_DIV_CLASS = "tile_div";
const BUILDING_DIV_ID = "building_div";

const LEFT_PANEL_ID = "left_panel";
const DISPLAY_PLAYER_FLAG_ID = "player_flag";
const DICE_DISPLAY_DIV_ID = "dice_roll_display";
const DICE_ROLL_BUTTON_ID = "dice_roll_button";
const DICE_ROLL_IMAGE_ID = "dice_roll_image";
const TILE_IMAGE_CLASS = "tile_image";

// const SELECT_DISPLAY_BUTTON_CONTAINER_ID_HEAD = "select_res_display";
const SELECT_DISPLAY_BUTTON_CLASS = "select_display";
// const SELECT_RES_DISPLAY_BUTTON_ID = "select_res_display";
// const SELECT_DEV_DISPLAY_BUTTON_ID = "select_dev_display";

const RES_CARD_DISPLAY_CLASS = "res_card_display";
const RES_CARD_CONTAINER_CLASS = "res_card_container";
const RES_CARD_CONTAINER_ID_HEAD = "res_card_container";
const DEV_CARD_DISPLAY_CLASS = "dev_card_display";
const DEV_CARD_CONTAINER_CLASS = "dev_card_container";
const DEV_CARD_CONTAINER_ID_HEAD = "dev_card_container";

const SHOP_WINDOW_DISPLAY_ID = "shop_window_display";
const RES_SELECT_CONTAINER_ID = "res_select_button_container";
const RES_SELECT_BUTTON_CLASS = "res_select_button"
const DISPLAYED_RES_CARD_CLASS = "displayed_res_card";
const DISPLAYED_DEV_CARD_CLASS = "displayed_dev_card";
const ACTION_WINDOW_DISPLAY_ID = "action_window_display";

const ACTION_BUTTON_CLASS = "action_button";

const SHOP_WINDOW_ROAD_ID = "road";
const SHOP_WINDOW_SETTLEMENT_ID = "settlement";
const SHOP_WINDOW_CITY_ID = "city";
const SHOP_WINDOW_DEVCARD_ID = "dev_card";
const SHOP_WINDOW_USECARD_ID = "use_card";
const SHOP_WINDOW_FINISHED_ID = "finished";

const RIGHT_PANEL_ID = "right_panel";
const PLAYER_BUTTON_CONTAINER_ID = "player_button_container";
const PLAYER_BUTTON_CLASS = "player_button";

const PLAYER_COLOURS = ["Blue", "Pink", "White", "Orange"];
const NO_PLAYERS = PLAYER_COLOURS.length;
const FILEPATH_SECTION_RESOURCE_HEX = "Images/Resource Hexagons/";
const FILEPATH_SECTION_GAME_PIECE = "Images/Game Pieces/";
const FILEPATH_SECTION_RES_CARD = "Images/Resource Cards/";
const FILEPATH_SECTION_DEV_CARD = "Images/Development Cards/";
const VILLAGE_RESOURCE_INCREMENT = 1;
const CITY_RESOURCE_INCREMENT = 2;