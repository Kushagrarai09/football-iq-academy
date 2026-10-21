export const navItems = [
  ["Basics", "/basics"], ["Pitch", "/pitch"], ["Rules", "/rules"],
  ["Positions", "/positions"], ["Formations", "/formations"], ["Tactics", "/tactics"],
  ["Skills", "/skills"], ["Scenarios", "/scenarios"], ["Referee", "/referee"],
  ["Glossary", "/glossary"], ["Quiz", "/quiz"],
] as const;

export const laws = [
  {n:1,title:"The Field of Play",slug:"field-of-play",summary:"Pitch dimensions, markings, goal area, penalty area and corner area.",activity:"Explore the pitch markings and their purpose."},
  {n:2,title:"The Ball",slug:"the-ball",summary:"Ball requirements and what happens if the ball becomes defective.",activity:"Compare approved ball characteristics and restart situations."},
  {n:3,title:"The Players",slug:"the-players",summary:"Team size, goalkeepers, substitutes and substitution rules.",activity:"Build a legal team and review player-number scenarios."},
  {n:4,title:"The Players' Equipment",slug:"players-equipment",summary:"Required kit, safety, jewellery and equipment restrictions.",activity:"Identify equipment that may need to be removed."},
  {n:5,title:"The Referee",slug:"the-referee",summary:"Authority, match control, decisions and advantage.",activity:"Choose a response to a match incident."},
  {n:6,title:"The Other Match Officials",slug:"other-match-officials",summary:"Assistant referees and other match officials.",activity:"Explore officials' positioning and responsibilities."},
  {n:7,title:"The Duration of the Match",slug:"duration-of-the-match",summary:"Halves, half-time, added time and extra time.",activity:"Explore a match timeline and stoppages."},
  {n:8,title:"The Start and Restart of Play",slug:"start-and-restart-of-play",summary:"Kick-offs and dropped balls.",activity:"Place players correctly for a restart."},
  {n:9,title:"The Ball In and Out of Play",slug:"ball-in-and-out-of-play",summary:"Boundary lines and when the whole ball has crossed them.",activity:"Pause a ball near a boundary and judge its status."},
  {n:10,title:"Determining the Outcome of a Match",slug:"determining-the-outcome",summary:"Goals, winning teams, draws and penalty shoot-outs.",activity:"Explore match outcome examples."},
  {n:11,title:"Offside",slug:"offside",summary:"Offside position, involvement in active play and exceptions.",activity:"Move attackers and defenders, then judge a pass."},
  {n:12,title:"Fouls and Misconduct",slug:"fouls-and-misconduct",summary:"Fouls, handball, free kicks and disciplinary sanctions.",activity:"Review a challenge and decide the likely outcome."},
  {n:13,title:"Free Kicks",slug:"free-kicks",summary:"Direct and indirect free kicks and restart procedures.",activity:"Compare direct and indirect free-kick outcomes."},
  {n:14,title:"The Penalty Kick",slug:"penalty-kick",summary:"Penalty procedure, player positioning and infringements.",activity:"Inspect a penalty setup and identify infringements."},
  {n:15,title:"The Throw-in",slug:"throw-in",summary:"Throw-in technique and restart requirements.",activity:"Check foot, hand and player positioning."},
  {n:16,title:"The Goal Kick",slug:"goal-kick",summary:"When a goal kick is awarded and how it is taken.",activity:"Choose the correct restart after a goal-line exit."},
  {n:17,title:"The Corner Kick",slug:"corner-kick",summary:"When a corner kick is awarded and how it is taken.",activity:"Position the ball and opponents for a corner."},
];

export const positions = [
 {id:"GK",name:"Goalkeeper",group:"Goalkeeper",summary:"Protects the goal, organizes the defence and distributes the ball.",attack:"Provides a safe passing option and can help build play from the back.",defend:"Protects the goal, communicates with defenders and manages space behind the defensive line.",tags:["Shot stopping","Distribution","Communication"]},
 {id:"CB",name:"Centre-back",group:"Defender",summary:"Defends central areas and helps prevent opponents from creating chances near goal.",attack:"Can progress possession with passes and support build-up.",defend:"Tracks forwards, covers teammates, challenges for the ball and protects the central area.",tags:["Cover","Aerial duels","Build-up"]},
 {id:"FB",name:"Full-back",group:"Defender",summary:"Defends wide areas and often supports attacks along the touchline.",attack:"Provides width, overlaps and may deliver crosses.",defend:"Tracks wingers and protects wide channels.",tags:["Width","Overlap","Recovery"]},
 {id:"WB",name:"Wing-back",group:"Defender",summary:"A wide role that often combines full-back and winger responsibilities.",attack:"Provides width and advances to support attacks.",defend:"Recovers into wide defensive positions and protects the flank.",tags:["Wide runs","Crossing","Transitions"]},
 {id:"DM",name:"Defensive midfielder",group:"Midfielder",summary:"Protects central space and connects defence with midfield possession.",attack:"Offers a passing option and helps circulate or progress the ball.",defend:"Screens the defence, tracks runners and can intercept passes.",tags:["Screening","Interceptions","Balance"]},
 {id:"CM",name:"Central midfielder",group:"Midfielder",summary:"Connects different areas of the pitch and supports both phases.",attack:"Creates angles, circulates possession and supports forward runs.",defend:"Presses, covers space and supports transitions.",tags:["Link play","Support","Tempo"]},
 {id:"AM",name:"Attacking midfielder",group:"Midfielder",summary:"Operates in advanced spaces to create and support scoring opportunities.",attack:"Finds space between lines, combines with forwards and creates chances.",defend:"Can initiate pressure and block passing lanes when the team presses.",tags:["Creativity","Through balls","Between lines"]},
 {id:"WG",name:"Winger",group:"Forward",summary:"Attacks wide areas, stretches the opposition and creates chances.",attack:"Can cross, dribble one-versus-one or move inside.",defend:"May track the opposing full-back and help the team press.",tags:["Dribbling","Width","Crossing"]},
 {id:"ST",name:"Striker",group:"Forward",summary:"Leads the attack and aims to convert chances into goals.",attack:"Makes runs behind defenders, combines with teammates and finishes.",defend:"May press centre-backs and help direct the opponent's build-up.",tags:["Finishing","Movement","Hold-up play"]},
];

export const formations = [
 {name:"4-3-3",shape:"4 defenders · 3 midfielders · 3 forwards",strengths:["Natural attacking width","Several forward pressing options","Flexible midfield roles"],tradeoffs:["Wide spaces may open behind advanced full-backs","Midfield balance depends on roles"]},
 {name:"4-4-2",shape:"4 defenders · 4 midfielders · 2 forwards",strengths:["Clear lines and roles","Two central forwards","Can defend compactly"],tradeoffs:["Can be outnumbered centrally","Midfielders may need to cover large areas"]},
 {name:"4-2-3-1",shape:"4 defenders · 2 deeper midfielders · 3 advanced midfielders · 1 striker",strengths:["Multiple midfield lines","Support behind the striker","Two deeper players can help protect the defence"],tradeoffs:["Needs coordination between the two deeper midfielders and advanced line","The lone striker can become isolated"]},
 {name:"3-5-2",shape:"3 centre-backs · 5 midfielders including wing-backs · 2 forwards",strengths:["Three central defenders","Two forwards","Can create central numbers"],tradeoffs:["Wing-backs cover large distances","Wide channels need coordinated cover"]},
 {name:"3-4-3",shape:"3 defenders · 4 midfielders including wing-backs · 3 forwards",strengths:["Multiple attacking lanes","Wide forwards can stretch defence","Wing-backs can provide width"],tradeoffs:["Wide defensive space can be exposed","Midfield spacing needs attention"]},
 {name:"4-1-4-1",shape:"4 defenders · 1 holding midfielder · 4 midfielders · 1 forward",strengths:["Midfield coverage","Can protect central areas","A flexible midfield line"],tradeoffs:["The lone forward may be isolated","Requires support runs to advance quickly"]},
];

export const glossary = [
 ["Offside","A player in an offside position is penalized only when they become involved in active play in a way covered by Law 11." ,"Rule"],
 ["Handball","An offence involving illegal contact with the ball by a player's hand or arm, judged under Law 12; not every touch is an offence.","Rule"],
 ["Advantage","The referee may allow play to continue when the non-offending team would benefit from not stopping play.","Rule"],
 ["Direct free kick","A restart from which a goal can be scored directly against the opponents.","Rule"],
 ["Indirect free kick","A restart from which a goal can only be scored if the ball subsequently touches another player before entering the goal.","Rule"],
 ["Through ball","A pass into space behind or between defenders for a teammate to run onto.","Attacking"],
 ["Cross","A pass from a wide area towards teammates in a more central or goal-facing position.","Attacking"],
 ["Counterattack","An attack developed after winning possession, often attempting to use space before the opposition reorganizes.","Tactics"],
 ["Overlap","A run around the outside of a teammate to create a wider attacking option.","Tactics"],
 ["Underlap","A run inside a teammate into a more central attacking lane.","Tactics"],
 ["High line","A defensive line positioned relatively far up the pitch.","Defending"],
 ["Pressing","Coordinated pressure intended to limit the opponent's time and passing options.","Defending"],
 ["Low block","A defensive structure that protects space closer to the team's own goal.","Defending"],
 ["Man-marking","A defensive approach in which players are assigned to track particular opponents.","Defending"],
 ["Zonal marking","A defensive approach focused on protecting designated areas of the pitch.","Defending"],
 ["Build-up","The process of moving possession from deeper areas towards more advanced positions.","Tactics"],
 ["First touch","The first contact used to control or redirect the ball after receiving it.","Skills"],
 ["Clean sheet","A match in which a team concedes no goals.","General"],
 ["Hat-trick","Three goals scored by one player in a match, using the common football definition.","General"],
 ["Volley","Striking the ball before it has touched the ground after being airborne.","Skills"],
];

export const quiz = [
 {question:"Which statement about offside is correct?",options:["Any player ahead of the defenders is automatically offside.","Being in an offside position alone is not an offence.","Offside is judged only when the player receives the ball."],answer:1,explanation:"The law evaluates the player's position when a teammate plays or touches the ball and whether the player subsequently becomes involved in active play. Position alone is not an offence."},
 {question:"How many players does a standard team have on the pitch at most, including the goalkeeper?",options:["9","10","11"],answer:2,explanation:"A team may have a maximum of eleven players on the pitch, one of whom must be the goalkeeper. Competition regulations and the Laws govern specific circumstances."},
 {question:"Which is a tactical concept rather than one of the 17 Laws of the Game?",options:["Throw-in","High pressing","Penalty kick"],answer:1,explanation:"High pressing is a tactical approach. Throw-ins and penalty kicks are covered by the official Laws of the Game."},
 {question:"From which restart can a goal be scored directly against the opponents?",options:["Throw-in","Indirect free kick","Direct free kick"],answer:2,explanation:"A goal can be scored directly from a direct free kick. A goal cannot be scored directly against the opponents from a throw-in or an indirect free kick."},
 {question:"What does a formation such as 4-3-3 normally describe?",options:["The referee and assistant referees","The distribution of ten outfield players across lines","The number of goals needed to win"],answer:1,explanation:"Formation numbers typically describe defenders, midfielders and forwards. The goalkeeper is not included in the numbers."},
];

export const scenarios = [
 {title:"Offside: position versus offence",category:"Law 11",prompt:"An attacker is in an offside position when a teammate plays the ball, but the attacker does not interfere with play or an opponent and gains no advantage. What is the key principle?",options:["Offside is automatically penalized","Position alone is not an offence","The attacker must receive a yellow card"],answer:1,explanation:"Being in an offside position alone is not an offence. Active involvement and the circumstances described in Law 11 determine whether an offence occurs."},
 {title:"Ball near the touchline",category:"Law 9",prompt:"The ball is partly above the touchline, but the whole ball has not crossed it. Is it out of play?",options:["Yes, any part outside means out","No, the whole ball must cross the line","Only if the referee raises a flag"],answer:1,explanation:"The whole ball must cross the boundary line for it to be out of play, unless the referee has stopped play for another reason."},
 {title:"Tactical width",category:"Tactics",prompt:"A team is struggling to find space in the middle. Which adjustment may stretch a compact opponent horizontally?",options:["Move every player into the same central lane","Use wider attacking positions","Leave all players behind the ball"],answer:1,explanation:"Using width can stretch the opposition and open channels, although the right response depends on the situation and the team's tactical plan."},
];
