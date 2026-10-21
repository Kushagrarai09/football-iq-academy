export type TeamId = "home" | "away";
export type Role = "striker" | "winger" | "midfielder" | "defender" | "goalkeeper";
export type PlayerMode = "idle" | "run" | "jump" | "kick" | "celebrate" | "dive";
export type AIMode = "defending" | "attacking" | "shooting" | "reposition";
export interface GamePlayer { id:string;team:TeamId;role:Role;x:number;y:number;vx:number;vy:number;facing:-1|1;speed:number;mode:PlayerMode;aiMode?:AIMode;homeX:number;homeY:number;actionCooldown:number;hasPossession:boolean }
export interface GameBall {x:number;y:number;vx:number;vy:number;z:number;vz:number;gravity:number;friction:number;bounce:number;possession:string|null;lastTouch:string|null;lastTouchTeam:TeamId|null}
export type Difficulty="easy"|"normal"|"hard";
export type MatchStatus="menu"|"playing"|"paused"|"goal"|"finished";
export interface GameState {players:GamePlayer[];ball:GameBall;score:{home:number;away:number};elapsed:number;duration:number;status:MatchStatus;lastScorer:TeamId|null;goalTimer:number;controlledPlayerId:string;difficulty:Difficulty;muted:boolean}
