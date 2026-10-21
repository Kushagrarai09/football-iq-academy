import type {GamePlayer,GameState,Role} from "./types";
export const PITCH={width:960,height:540,left:42,right:918,top:82,bottom:462,goalTop:226,goalBottom:318,goalDepth:24,playerRadius:15,ballRadius:8} as const;
export const DEFAULT_MATCH_SECONDS=120;
export const GOAL_CELEBRATION_SECONDS=2.2;
export const ROLE_SPEED:Record<Role,number>={striker:.36,winger:.39,midfielder:.34,defender:.31,goalkeeper:.25};
export function createPlayers():GamePlayer[]{const setup:Array<Omit<GamePlayer,"vx"|"vy"|"mode"|"actionCooldown"|"hasPossession">>=[
{id:"home-keeper",team:"home",role:"goalkeeper",x:.055,y:.5,facing:1,speed:ROLE_SPEED.goalkeeper,homeX:.055,homeY:.5},
{id:"home-defender",team:"home",role:"defender",x:.24,y:.5,facing:1,speed:ROLE_SPEED.defender,homeX:.24,homeY:.5},
{id:"home-midfielder",team:"home",role:"midfielder",x:.38,y:.36,facing:1,speed:ROLE_SPEED.midfielder,homeX:.38,homeY:.36},
{id:"home-striker",team:"home",role:"striker",x:.45,y:.66,facing:1,speed:ROLE_SPEED.striker,homeX:.45,homeY:.66},
{id:"away-keeper",team:"away",role:"goalkeeper",x:.945,y:.5,facing:-1,speed:ROLE_SPEED.goalkeeper,homeX:.945,homeY:.5},
{id:"away-defender",team:"away",role:"defender",x:.76,y:.5,facing:-1,speed:ROLE_SPEED.defender,homeX:.76,homeY:.5},
{id:"away-midfielder",team:"away",role:"midfielder",x:.62,y:.36,facing:-1,speed:ROLE_SPEED.midfielder,homeX:.62,homeY:.36},
{id:"away-striker",team:"away",role:"striker",x:.55,y:.66,facing:-1,speed:ROLE_SPEED.striker,homeX:.55,homeY:.66}];
return setup.map(p=>({...p,vx:0,vy:0,mode:"idle",actionCooldown:0,hasPossession:false} as GamePlayer));}
export function createInitialState(duration=DEFAULT_MATCH_SECONDS):GameState{const players=createPlayers();const holder=players.find(p=>p.id==="home-striker")!;holder.hasPossession=true;return{players,ball:{x:holder.x+.04,y:holder.y+.03,vx:0,vy:0,z:0,vz:0,gravity:1.9,friction:1.3,bounce:.38,possession:holder.id,lastTouch:holder.id,lastTouchTeam:"home"},score:{home:0,away:0},elapsed:0,duration,status:"menu",lastScorer:null,goalTimer:0,controlledPlayerId:holder.id,difficulty:"normal",muted:false};}
