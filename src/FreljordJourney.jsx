import { useCallback, useEffect, useMemo, useState } from "react";
import "./freljord.css";

const skills = {
  attack: {
    id: "attack",
    key: "A",
    name: "普通攻击",
    type: "attack",
    typeName: "攻击",
    cost: 0,
    icon: "✦",
    text: "造成 5 点伤害，并触发攻击类装备。",
  },
  q: {
    id: "q",
    key: "Q",
    name: "破裂",
    type: "spell",
    typeName: "技能",
    cost: 1,
    icon: "△",
    text: "造成法术伤害并眩晕敌人；眩晕会使敌人本回合无法行动。",
  },
  w: {
    id: "w",
    key: "W",
    name: "野性尖叫",
    type: "spell",
    typeName: "技能",
    cost: 1,
    icon: "◈",
    text: "造成法术伤害并打断特殊行动；敌人本回合改用普攻。",
  },
  e: {
    id: "e",
    key: "E",
    name: "恐惧之刺",
    type: "spell",
    typeName: "技能",
    cost: 1,
    icon: "⌁",
    text: "强化接下来的 2 次普通攻击。",
  },
  r: {
    id: "r",
    key: "R",
    name: "盛宴",
    type: "finisher",
    typeName: "终极技能",
    cost: 2,
    icon: "◆",
    text: "进入斩杀线时处决；每次斩杀英雄单位永久获得8点最大生命，无次数上限。",
  },
};

const baseStarterDeck = [
  "attack",
  "q",
  "attack",
  "w",
  "e",
  "attack",
  "attack",
  "r",
  "attack",
  "attack",
  "attack",
  "attack",
];

// 普攻与技能接近 1:1；每场战斗和弃牌回洗时都会重新洗牌。
const starterDeck = [...baseStarterDeck];

// 玩家所有直接伤害与卡牌预览共用该倍率，确保显示数值与实际结算一致。
const HERO_DAMAGE_SCALE = 0.25;

const championRoster = {
  cho: {
    id: "cho",
    name: "科加斯",
    role: "坦克 · 法师",
    image: "/game-icons/cho.png",
    hp: 86,
    ad: 5,
    ap: 0,
    color: "#9c63cb",
    mechanic: "盛宴成长",
    description: "控制危险行动，以盛宴斩杀敌人并永久成长。",
    builds: ["心之钢巨兽", "裂隙法坦", "巫妖连招"],
    preferredTags: ["生命", "法强", "控制"],
    skills,
  },
  darius: {
    id: "darius",
    name: "诺手",
    role: "战士 · 终结者",
    image: "/game-icons/darius.png",
    hp: 78,
    ad: 8,
    ap: 0,
    color: "#b44747",
    mechanic: "五层流血",
    description: "普攻与技能叠加流血，满层后用断头台收割。",
    builds: ["征战战士", "血怒流血", "暴击断头台", "无限断头台"],
    preferredTags: ["普攻", "持续", "生命"],
    skills: {
      attack: {
        ...skills.attack,
        name: "普通攻击",
        text: "造成AD伤害并施加1层流血。",
      },
      q: {
        id: "q",
        key: "Q",
        name: "大杀四方",
        type: "spell",
        typeName: "技能",
        cost: 1,
        icon: "◯",
        text: "造成伤害、恢复生命并对敌人施加1层流血。",
      },
      w: {
        id: "w",
        key: "W",
        name: "致残打击",
        type: "spell",
        typeName: "技能",
        cost: 1,
        icon: "✦",
        text: "立即打出一次强化普攻，并额外施加流血。",
      },
      e: {
        id: "e",
        key: "E",
        name: "无情铁手",
        type: "spell",
        typeName: "技能",
        cost: 1,
        icon: "⌁",
        text: "打断敌人的特殊行动；敌人会改用普通攻击。",
      },
      r: {
        id: "r",
        key: "R",
        name: "诺克萨斯断头台",
        type: "finisher",
        typeName: "终极技能",
        cost: 2,
        icon: "◆",
        text: "根据流血层数造成高额伤害；满层流血时，打出后立即将这张 R 返回手牌。",
      },
    },
  },
  twistedfate: {
    id: "twistedfate",
    name: "卡牌大师",
    role: "法师 · 策略",
    image: "/game-icons/twistedfate.png",
    hp: 65,
    ad: 5,
    ap: 4,
    color: "#c99b48",
    mechanic: "选牌轮换",
    description: "蓝牌回能、红牌爆发、金牌控制，规划每一轮出牌。",
    builds: ["巫妖黄牌", "卢登连发", "帽子爆发"],
    preferredTags: ["法强", "施法", "连招"],
    skills: {
      attack: {
        ...skills.attack,
        name: "飞牌",
        text: "造成AD伤害；触发当前选中的牌。",
      },
      q: {
        id: "q",
        key: "Q",
        name: "万能牌",
        type: "spell",
        typeName: "技能",
        cost: 1,
        icon: "⋙",
        text: "造成高额魔法伤害；消耗命运标记增伤。",
      },
      w: {
        id: "w",
        key: "W",
        name: "选牌",
        type: "spell",
        typeName: "技能",
        cost: 1,
        icon: "▣",
        text: "从蓝、红、金牌中选择一张，将下一张普通攻击替换为所选牌。",
      },
      e: {
        id: "e",
        key: "E",
        name: "卡牌骗术",
        type: "spell",
        typeName: "技能",
        cost: 1,
        icon: "✧",
        text: "获得2层充能，使后续普攻附加魔法伤害。",
      },
      r: {
        id: "r",
        key: "R",
        name: "命运",
        type: "finisher",
        typeName: "终极技能",
        cost: 2,
        icon: "◉",
        text: "施加命运标记并抽2张牌。",
      },
    },
  },
  jinx: {
    id: "jinx",
    name: "金克斯",
    role: "射手 · 爆发",
    image: "/game-icons/jinx.png",
    hp: 72,
    ad: 8,
    ap: 0,
    color: "#dc5d9f",
    mechanic: "武器切换",
    description: "机枪越打越快，火箭完成重击；破败与饮血剑提供持续续航。",
    builds: ["无限机枪", "暴击火箭", "穿甲Poke"],
    preferredTags: ["普攻", "连招", "终结"],
    skills: {
      attack: {
        ...skills.attack,
        name: "普通攻击",
        text: "按当前武器攻击；机枪连击或火箭增伤。",
      },
      q: {
        id: "q",
        key: "Q",
        name: "枪炮交响曲",
        type: "spell",
        typeName: "技能",
        cost: 0,
        icon: "⇄",
        text: "在机枪与火箭发射器之间切换。",
      },
      w: {
        id: "w",
        key: "W",
        name: "震荡电磁波",
        type: "spell",
        typeName: "技能",
        cost: 1,
        icon: "➶",
        text: "造成物理伤害并标记敌人。",
      },
      e: {
        id: "e",
        key: "E",
        name: "嚼火者",
        type: "spell",
        typeName: "技能",
        cost: 1,
        icon: "△",
        text: "布置嚼火者并眩晕敌人；敌人本回合完全无法行动。",
      },
      r: {
        id: "r",
        key: "R",
        name: "超级死亡火箭",
        type: "finisher",
        typeName: "终极技能",
        cost: 2,
        icon: "☄",
        text: "敌人损失生命越多，造成的伤害越高。",
      },
    },
  },
  tahmkench: {
    id: "tahmkench",
    name: "塔姆",
    role: "坦克 · 法坦",
    image: "/game-icons/tahmkench.png",
    hp: 92,
    ad: 5,
    ap: 1,
    color: "#4e9b88",
    mechanic: "培养品味",
    description: "普攻叠加品味，Q眩晕满层敌人，吞噬完成生命成长。",
    builds: ["巨胃肉坦", "裂隙AP", "盾盾流"],
    preferredTags: ["生命", "法强", "恢复"],
    skills: {
      attack: {
        ...skills.attack,
        name: "巨舌鞭打",
        text: "造成AD伤害并施加1层培养品味。",
      },
      q: {
        id: "q",
        key: "Q",
        name: "巨舌鞭笞",
        type: "spell",
        typeName: "技能",
        cost: 1,
        icon: "➶",
        text: "造成魔法伤害；3层品味时打断并眩晕。",
      },
      w: {
        id: "w",
        key: "W",
        name: "深渊潜航",
        type: "spell",
        typeName: "技能",
        cost: 1,
        icon: "⌁",
        text: "造成魔法伤害并打断蓄力。",
      },
      e: {
        id: "e",
        key: "E",
        name: "厚实表皮",
        type: "spell",
        typeName: "技能",
        cost: 1,
        icon: "⬡",
        text: "根据本场已损生命获得护盾。",
      },
      r: {
        id: "r",
        key: "R",
        name: "大快朵颐",
        type: "finisher",
        typeName: "终极技能",
        cost: 2,
        icon: "◆",
        text: "满层品味提高吞噬伤害；仅能斩杀残血敌人，BOSS斩杀线更低。",
      },
    },
  },
};

const championBuilds = {
  darius: [
    { id: "darius_fighter", name: "征战战士", items: ["cleaver", "shojin", "sterak", "deathdance", "titanic", "trinity", "hexplate"] },
    { id: "darius_bleed", name: "血怒流血", items: ["cleaver", "titanic", "sterak", "shojin", "collector"] },
    { id: "darius_crit", name: "暴击断头台", items: ["collector", "essence", "infinity", "phantom", "deathdance"] },
    { id: "darius_infinite_r", name: "无限断头台", items: ["shojin", "hexplate", "axiom", "cleaver", "deathdance"] },
  ],
  jinx: [
    { id: "jinx_draw", name: "无限机枪", items: ["bork", "phantom", "kraken", "essence", "bloodthirster", "guinsoo", "trinity"] },
    { id: "jinx_crit", name: "暴击火箭", items: ["collector", "infinity", "bloodthirster", "essence", "phantom"] },
    { id: "jinx_poke", name: "穿甲Poke", items: ["youmuu", "manamune", "serylda", "collector", "axiom", "horizon", "hexplate"] },
  ],
  tahmkench: [
    { id: "tahm_tank", name: "巨胃肉坦", items: ["heartsteel", "sunfire", "titanic", "despair", "warmog", "frozenheart"] },
    { id: "tahm_ap", name: "裂隙AP", items: ["riftmaker", "nashor", "lichbane", "shadowflame", "rabadon"] },
    { id: "tahm_shield", name: "盾盾流", items: ["fimbulwinter", "moonstone", "despair", "dawncore", "visage", "frozenheart"] },
  ],
  cho: [
    { id: "cho_tank", name: "心钢巨兽", items: ["heartsteel", "sunfire", "titanic", "jaksho", "warmog", "frozenheart"] },
    { id: "cho_ap", name: "裂隙法坦", items: ["riftmaker", "lichbane", "shadowflame", "rabadon", "nashor"] },
    { id: "cho_burn", name: "灼烧控制", items: ["liandry", "banshee", "riftmaker", "iceborn", "rabadon", "horizon", "cosmic"] },
  ],
  twistedfate: [
    { id: "tf_burst", name: "命运爆发", items: ["luden", "shadowflame", "rabadon", "lichbane", "banshee", "horizon", "hexplate"] },
    { id: "tf_onhit", name: "黄牌普攻", items: ["nashor", "lichbane", "riftmaker", "banshee", "rabadon", "guinsoo", "trinity"] },
    { id: "tf_burn", name: "持续施法", items: ["liandry", "riftmaker", "luden", "banshee", "shadowflame", "cosmic"] },
  ],
};

const championGuides = {
  cho: { loop: "用Q眩晕跳过敌方回合，W打断危险行动，E强化普攻压低血线，最后用R盛宴斩杀成长。", control: "Q是眩晕：敌人无法行动；W是打断：敌人仍会改用普攻。", warning: "盛宴必须进入卡牌显示的斩杀线；每次斩杀英雄单位永久增加8点最大生命且无上限，并强化心之钢、九头蛇与裂隙制造者。" },
  darius: { loop: "用普攻和W快速叠流血，Q维持续航，满层后以R打出最高爆发。", control: "E只打断特殊行动，敌人随后改用普攻；它不会让敌人跳过回合。", warning: "集齐朔极之矛、实验性海克斯板甲和公理圆弧后，满层流血可让R回手并返还2能量，形成无限断头台。" },
  twistedfate: { loop: "打出W后三选一：蓝牌回能、红牌增伤、金牌控制；所选牌由下一张A触发。R标记后接Q爆发。", control: "金牌可直接选择。普通怪命中即眩晕；精英与BOSS需要累计2点韧性压力。", warning: "W不造成伤害；选牌后必须用A打出，结算后恢复普通攻击。R会抽牌并让下一张Q提高50%伤害。" },
  jinx: { loop: "机枪连续普攻叠至3层后开始抽牌循环；需要爆发时用Q切换火箭，W与R负责远程收割。", control: "E嚼火者是眩晕：敌人本回合完全无法行动；赛瑞尔达强化的W只是打断。", warning: "金克斯牌组只保留1张切枪Q，其余替换为A普攻；机枪抽牌每回合有上限，破败与饮血剑提供续航。" },
  tahmkench: { loop: "普攻叠3层品味；满层Q消耗品味并眩晕，E把累计受伤转为护盾，R用于残血收割。", control: "只有满3层品味的Q是真正眩晕；W只是打断，敌人会改用普攻。", warning: "3层品味只让R伤害提高35%，不会直接处决；BOSS的吞噬斩杀线更低。" },
};

const equipment = {
  heartsteel: {
    id: "heartsteel",
    name: "心之钢",
    price: 28,
    image: "/game-icons/heartsteel.png",
    hp: 20,
    tags: ["生命", "成长"],
    text: "第二回合起蓄力。下一次普攻造成最大生命 8% 的额外伤害，并永久增加 2% 最大生命；每场一次。",
  },
  riftmaker: {
    id: "riftmaker",
    name: "裂隙制造者",
    price: 30,
    image: "/game-icons/riftmaker.png",
    hp: 12,
    ap: 4,
    tags: ["生命", "法强"],
    text: "每 10 点永久额外最大生命提供 1 AP；第四回合起技能伤害提高 15%。",
  },
  lichbane: {
    id: "lichbane",
    name: "巫妖之祸",
    price: 26,
    image: "/game-icons/lichbane.png",
    ap: 6,
    tags: ["法强", "连招"],
    text: "每回合第一次施放技能后，下一次普攻附加 5 + AP×1.0 魔法伤害。",
  },
  sunfire: {
    id: "sunfire",
    name: "日炎斗篷",
    price: 24,
    image: "/game-icons/sunfire.png",
    hp: 15,
    tags: ["生命", "持续"],
    text: "每个敌人回合结束时，造成最大生命 4% 的伤害。",
  },
  warmog: {
    id: "warmog",
    name: "狂徒铠甲",
    price: 32,
    image: "/game-icons/warmog.png",
    hp: 30,
    tags: ["生命", "续航"],
    text: "战斗胜利后恢复最大生命 18%。",
  },
  titanic: {
    id: "titanic",
    name: "巨型九头蛇",
    price: 28,
    image: "/game-icons/titanic.png",
    hp: 18,
    tags: ["生命", "普攻"],
    text: "普通攻击额外造成最大生命 4% 的伤害。",
  },
  luden: {
    id: "luden",
    name: "卢登的回声",
    price: 28,
    image: "/game-icons/luden.png",
    ap: 7,
    tags: ["法强", "施法"],
    text: "每施放第 3 个技能，额外造成 10 + AP×0.6 伤害。",
  },
  rabadon: {
    id: "rabadon",
    name: "灭世者的死亡之帽",
    price: 38,
    image: "/game-icons/rabadon.png",
    ap: 10,
    tags: ["法强", "终结"],
    text: "进入战斗时，总 AP 提高 30%。",
  },
  nashor: {
    id: "nashor",
    name: "纳什之牙",
    price: 27,
    image: "/game-icons/nashor.png",
    ap: 5,
    tags: ["法强", "普攻"],
    text: "所有普通攻击附加 2 + AP×0.4 魔法伤害。",
  },
  visage: {
    id: "visage",
    name: "振奋盔甲",
    price: 25,
    image: "/game-icons/visage.png",
    hp: 16,
    tags: ["生命", "恢复"],
    text: "英雄技能治疗与战后恢复效果提高 50%。",
  },
  thornmail: {
    id: "thornmail",
    name: "荆棘之甲",
    price: 23,
    image: "/game-icons/thornmail.png",
    hp: 14,
    tags: ["生命", "反伤"],
    text: "每次受到敌人伤害后反击 7 点；拥有尖刺防御时提高为 12 点。",
  },
  iceborn: {
    id: "iceborn",
    name: "冰脉护手",
    price: 27,
    image: "/game-icons/iceborn.png",
    hp: 18,
    tags: ["生命", "控制"],
    text: "Q 或 W 成功打断后，下一次普攻额外造成最大生命 7% 的伤害。",
  },
  shadowflame: {
    id: "shadowflame",
    name: "影焰",
    price: 34,
    image: "/game-icons/shadowflame.png",
    ap: 10,
    tags: ["法强", "终结"],
    text: "敌人生命低于 40% 时，Q 与 W 造成 20% 额外伤害。",
  },
  jaksho: {
    id: "jaksho",
    name: "千变者贾修",
    price: 35,
    image: "/game-icons/jaksho.png",
    hp: 24,
    tags: ["生命", "持久"],
    text: "第四回合开始获得最大生命 15% 护盾，且裂隙制造者的增伤提前生效。",
  },
  liandry: {
    id: "liandry",
    name: "兰德里的折磨",
    price: 29,
    image: "/game-icons/liandry.png",
    ap: 7,
    tags: ["法强", "持续"],
    text: "Q 或 W 命中后施加灼烧，在敌方回合结束时造成 6+AP×0.35 伤害。",
  },
  banshee: {
    id: "banshee",
    name: "女妖面纱",
    price: 25,
    image: "/game-icons/banshee.png",
    ap: 5,
    tags: ["法强", "防御"],
    text: "每场战斗第一次受到伤害时完全抵消；随后为巫妖之祸充能。",
  },
  cleaver: { id: "cleaver", name: "黑色切割者", price: 27, image: "/game-icons/cleaver.png", ad: 3, hp: 12, tags: ["战士", "流血"], routes: ["darius_fighter", "darius_bleed"], text: "每层流血使诺手造成的伤害提高 3%；满层额外提高 10%。" },
  shojin: { id: "shojin", name: "朔极之矛", price: 31, image: "/game-icons/shojin.png", ad: 4, hp: 10, tags: ["战士", "技能", "抽牌"], routes: ["darius_fighter", "darius_infinite_r"], text: "每打出 1 张技能牌，立即抽 1 张牌；手牌达到8张时不再抽取。" },
  sterak: { id: "sterak", name: "斯特拉克的挑战护手", price: 30, image: "/game-icons/sterak.png", ad: 3, hp: 18, tags: ["战士", "护盾"], routes: ["darius_fighter", "tahm_shield"], text: "每场首次生命低于 40% 时，获得最大生命 25% 的护盾。" },
  deathdance: { id: "deathdance", name: "死亡之舞", price: 29, image: "/game-icons/deathdance.png", ad: 4, tags: ["战士", "续航"], routes: ["darius_fighter"], text: "终极技能斩杀时恢复 16% 最大生命，并清除敌人的攻击强化。" },
  collector: { id: "collector", name: "收集者", price: 30, image: "/game-icons/collector.png", ad: 4, crit: 18, armorPen: 3, tags: ["暴击", "穿甲", "终结"], routes: ["darius_crit", "jinx_crit", "jinx_poke"], text: "伤害可暴击；敌人生命低于 8% 时直接处决。" },
  infinity: { id: "infinity", name: "无尽之刃", price: 38, image: "/game-icons/infinity.png", ad: 6, crit: 25, tags: ["暴击", "终结"], routes: ["darius_crit", "jinx_crit"], text: "暴击伤害从 175% 提高到 225%。" },
  essence: { id: "essence", name: "夺萃之镰", price: 29, image: "/game-icons/essence.png", ad: 4, crit: 18, tags: ["暴击", "抽牌"], routes: ["darius_crit", "jinx_draw"], text: "每回合第一次普攻暴击时，恢复 1 能量并抽 1 张牌。" },
  bork: { id: "bork", name: "破败王者之刃", price: 27, image: "/game-icons/bork.png", ad: 3, tags: ["机枪", "普攻", "恢复"], routes: ["jinx_draw"], text: "普攻额外造成敌人当前生命5%的伤害，并恢复本次普攻伤害的15%。" },
  bloodthirster: { id: "bloodthirster", name: "饮血剑", price: 32, image: "/game-icons/bloodthirster.png", ad: 5, crit: 18, tags: ["暴击", "恢复", "护盾"], routes: ["jinx_draw", "jinx_crit"], text: "普攻恢复所造成伤害的25%；满生命时治疗转化为护盾，最多为最大生命20%。" },
  phantom: { id: "phantom", name: "幻影之舞", price: 26, image: "/game-icons/phantom.png", crit: 18, tags: ["机枪", "暴击"], routes: ["jinx_draw", "jinx_crit"], text: "机枪每层连击额外增加 2 点伤害；满层后每第 2 次普攻抽 1 张。" },
  kraken: { id: "kraken", name: "海妖杀手", price: 29, image: "/game-icons/kraken.png", ad: 4, tags: ["机枪", "普攻"], routes: ["jinx_draw"], text: "每第 3 次普攻额外造成 14+AD×0.8 伤害。" },
  manamune: { id: "manamune", name: "魔宗", price: 26, image: "/game-icons/manamune.png", ad: 3, tags: ["穿甲", "施法"], routes: ["jinx_poke"], text: "W 与 R 额外造成 4×当前能量的伤害；每场第 3 次施法后再抽 1 张。" },
  youmuu: { id: "youmuu", name: "幽梦之灵", price: 27, image: "/game-icons/youmuu.png", ad: 5, armorPen: 5, tags: ["穿甲", "爆发"], routes: ["jinx_poke"], text: "每回合第一张 W 或 R 额外造成 8 点伤害。" },
  serylda: { id: "serylda", name: "赛瑞尔达的怨恨", price: 31, image: "/game-icons/serylda.png", ad: 4, armorPen: 7, tags: ["穿甲", "控制"], routes: ["jinx_poke"], text: "W 能打断危险行动；W 与 R 无视 7 点护盾并获得穿甲增伤。" },
  axiom: { id: "axiom", name: "公理圆弧", price: 32, image: "/game-icons/axiom.png", ad: 5, armorPen: 4, tags: ["穿甲", "终结", "能量"], routes: ["jinx_poke", "darius_infinite_r"], text: "每次打出 R 后恢复 1 能量；金克斯每场首次打出 R 时，额外将一张 R 返回手牌。" },
  fimbulwinter: { id: "fimbulwinter", name: "末日寒冬", price: 28, image: "/game-icons/fimbulwinter.png", hp: 18, tags: ["护盾", "控制"], routes: ["tahm_shield"], text: "Q 或 W 打断敌人时获得最大生命 10% 护盾。" },
  despair: { id: "despair", name: "无终恨意", price: 30, image: "/game-icons/despair.png", hp: 20, tags: ["护盾", "恢复", "生命"], routes: ["tahm_tank", "tahm_shield"], text: "护盾被消耗后，对敌人造成消耗量 50% 的伤害并恢复等量生命。" },
  moonstone: { id: "moonstone", name: "月石再生器", price: 26, image: "/game-icons/moonstone.png", ap: 4, hp: 10, tags: ["护盾", "恢复"], routes: ["tahm_shield"], text: "厚实表皮的护盾提高 35%，获得护盾时恢复其数值 20% 的生命。" },
  dawncore: { id: "dawncore", name: "黎明核心", price: 34, image: "/game-icons/dawncore.png", ap: 6, tags: ["护盾", "法强"], routes: ["tahm_shield", "tahm_ap"], text: "每持有一件护盾装备，厚实表皮护盾与AP提高 8%。" },
  trinity: { id: "trinity", name: "三相之力", price: 31, image: "/game-icons/trinity.png", ad: 4, hp: 10, tags: ["战士", "连招", "普攻"], text: "每回合第一次打出技能后，为下一张 A 充能；该 A 的基础伤害增加 6 + AD×0.7。" },
  guinsoo: { id: "guinsoo", name: "鬼索的狂暴之刃", price: 29, image: "/game-icons/guinsoo.svg", ad: 3, ap: 3, tags: ["普攻", "连击"], text: "每第 3 张 A 的基础伤害增加 8 + AD×0.5，普攻计数跨回合保留。" },
  cosmic: { id: "cosmic", name: "宇宙驱动", price: 28, image: "/game-icons/cosmic.svg", ap: 6, hp: 8, tags: ["法强", "抽牌", "技能"], text: "每回合打出的第 2 张技能牌额外抽 1 张牌；每回合触发一次。" },
  horizon: { id: "horizon", name: "视界专注", price: 30, image: "/game-icons/horizon.svg", ap: 7, tags: ["法强", "预判", "技能"], text: "敌人显示危险或蓄力意图时，Q 与 W 的总伤害提高 25%。" },
  hexplate: { id: "hexplate", name: "实验性海克斯板甲", price: 32, image: "/game-icons/hexplate.svg", ad: 4, hp: 10, tags: ["终极技能", "能量", "抽牌"], routes: ["darius_fighter", "darius_infinite_r", "jinx_poke", "tf_burst"], text: "每次打出 R 后恢复 1 能量；每场战斗首次触发时额外抽 1 张牌。" },
  frozenheart: { id: "frozenheart", name: "冰霜之心", price: 27, image: "/game-icons/frozenheart.svg", hp: 16, tags: ["生命", "护盾", "技能"], text: "每回合第一次打出 E，恢复 1 能量并获得最大生命 8% 的护盾。" },
};

const equipmentStats = (item) => [
  item.hp && `生命 +${item.hp}`,
  item.ad && `AD +${item.ad}`,
  item.ap && `AP +${item.ap}`,
  item.crit && `暴击 +${item.crit}%`,
  item.armorPen && `穿甲 +${item.armorPen}`,
].filter(Boolean);

const enemies = {
  wolf: {
    name: "冰原狼王",
    subtitle: "冰原生物",
    hp: 58,
    gold: 10,
    image: "/game-icons/enemy-wolf.png",
    theme: "wolf",
    actions: [
      { name: "撕咬", text: "造成 9 点伤害", damage: 9, icon: "⚔" },
      {
        name: "伏击蓄力",
        text: "准备狂猎；可被 Q 或 W 打断",
        charge: 18,
        icon: "◎",
        dangerous: true,
      },
      {
        name: "狂猎",
        text: "造成 6×3 点伤害，下回合能量 -1",
        damage: 18,
        drain: 1,
        icon: "⚔⚔",
        dangerous: true,
      },
    ],
  },
  archer: {
    name: "冰霜弓灵",
    subtitle: "弗雷尔卓德灵体",
    hp: 76,
    gold: 18,
    image: "/game-icons/enemy-archer.png",
    theme: "archer",
    actions: [
      { name: "寒冰箭", text: "造成 11 点伤害", damage: 11, icon: "➶" },
      {
        name: "冰脉禁锢",
        text: "造成 7 点伤害，下回合能量 -1",
        damage: 7,
        drain: 1,
        icon: "❄",
        dangerous: true,
      },
      {
        name: "冻结箭雨",
        text: "造成 8 点伤害，下回合能量 -1",
        damage: 8,
        drain: 1,
        icon: "❄",
      },
    ],
  },
  yeti: {
    name: "远古雪怪",
    subtitle: "精英生物",
    hp: 118,
    gold: 14,
    image: "/game-icons/enemy-yeti.png",
    theme: "yeti",
    elite: true,
    actions: [
      { name: "重拳", text: "造成 14 点伤害", damage: 14, icon: "✊" },
      {
        name: "雪球蓄力",
        text: "准备 26 点冲撞；必须应对",
        charge: 26,
        icon: "◉",
        dangerous: true,
      },
      {
        name: "雪崩冲撞",
        text: "造成 26 点伤害",
        damage: 26,
        icon: "☄",
        dangerous: true,
      },
      { name: "冰牢震击", text: "造成 10 点伤害，下回合能量 -1", damage: 10, drain: 1, icon: "❄" },
    ],
  },
  boar: {
    name: "凛冬战猪",
    subtitle: "凛冬之爪战兽",
    hp: 104,
    gold: 10,
    image: "/game-icons/enemy-boar.png",
    theme: "yeti",
    actions: [
      { name: "獠牙突刺", text: "造成 13 点伤害", damage: 13, icon: "♜" },
      {
        name: "冻土践踏",
        text: "造成 9 点伤害，下回合能量 -1",
        damage: 9,
        drain: 1,
        icon: "❄",
        dangerous: true,
      },
      {
        name: "践踏",
        text: "造成 10×2 点伤害",
        damage: 20,
        icon: "♜♜",
        dangerous: true,
      },
    ],
  },
  nunu: {
    name: "努努和威朗普",
    subtitle: "第一幕首领",
    hp: 175,
    gold: 19,
    image: "/game-icons/enemy-nunu.png",
    theme: "boss",
    boss: true,
    actions: [
      { name: "雪球飞射", text: "造成 14 点伤害", damage: 14, icon: "●" },
      {
        name: "史上最大雪球",
        text: "准备 32 点冲撞；可被 Q 或 W 打断",
        charge: 32,
        icon: "◉",
        dangerous: true,
      },
      {
        name: "雪球冲撞",
        text: "造成 32 点伤害",
        damage: 32,
        icon: "☄",
        dangerous: true,
      },
      { name: "绝对零度", text: "造成 12 点伤害，下回合能量 -1", damage: 12, drain: 1, icon: "❄", dangerous: true },
    ],
  },
  lissandra: {
    name: "丽桑卓",
    subtitle: "第三幕最终首领",
    hp: 420,
    gold: 0,
    image: "/game-icons/enemy-lissandra.png",
    theme: "archer",
    finalBoss: true,
    actions: [
      { name: "寒冰碎片", text: "造成 11 点伤害", damage: 11, icon: "❄" },
      {
        name: "冰封陵墓",
        text: "准备 21 点伤害；必须用 Q 或 W 打断",
        charge: 21,
        icon: "◆",
        dangerous: true,
      },
      {
        name: "黑冰爆裂",
        text: "造成 21 点伤害",
        damage: 21,
        icon: "✦",
        dangerous: true,
      },
      {
        name: "冰霜守卫",
        text: "获得 32 点护盾；可被沉默",
        shield: 32,
        icon: "⬡",
        dangerous: true,
      },
    ],
  },
  demonTeemo: {
    name: "提莫大魔王",
    subtitle: "登顶终极挑战",
    hp: 520,
    gold: 0,
    image: "/game-icons/enemy-teemo.png",
    theme: "boss",
    finalBoss: true,
    demonBoss: true,
    actions: [
      { name: "恶魔吹箭", text: "造成 18 点伤害，并施加致盲", damage: 18, blind: 2, icon: "➶", dangerous: true },
      { name: "剧毒射击", text: "造成 16 点伤害", damage: 16, icon: "☠" },
      { name: "蘑菇陷阱", text: "蓄力 36 点伤害；可被打断", charge: 36, icon: "●", dangerous: true },
      { name: "恶魔突袭", text: "造成 36 点伤害", damage: 36, icon: "⚔", dangerous: true },
    ],
  },
};

const route = [
  {
    chapter: 1,
    type: "battle",
    title: "狼王领地",
    subtitle: "普通战斗",
    enemy: "wolf",
    icon: "⚔",
  },
  {
    chapter: 1,
    type: "battle",
    title: "寒风峡谷",
    subtitle: "普通战斗",
    enemy: "archer",
    icon: "➶",
    augment: true,
  },
  {
    chapter: 1,
    type: "rest",
    title: "炉火营地",
    subtitle: "随机机动强化",
    icon: "♨",
  },
  {
    chapter: 1,
    type: "battle",
    title: "雪怪洞穴",
    subtitle: "精英战斗",
    enemy: "yeti",
    icon: "♜",
    augment: true,
  },
  {
    chapter: 1,
    type: "battle",
    title: "凛冬兽径",
    subtitle: "普通战斗",
    enemy: "boar",
    icon: "♞",
  },
  {
    chapter: 1,
    type: "battle",
    title: "雪球山坡",
    subtitle: "章节首领",
    enemy: "nunu",
    icon: "♛",
    chapterBoss: true,
  },
  {
    chapter: 2,
    type: "battle",
    title: "霜卫哨所",
    subtitle: "普通战斗",
    enemy: "archer",
    icon: "➶",
  },
  {
    chapter: 2,
    type: "battle",
    title: "狂兽雪谷",
    subtitle: "普通战斗",
    enemy: "boar",
    icon: "♞",
  },
  {
    chapter: 2,
    type: "rest",
    title: "失落炉乡",
    subtitle: "随机机动强化",
    icon: "♨",
  },
  {
    chapter: 2,
    type: "battle",
    title: "远古兽穴",
    subtitle: "精英战斗",
    enemy: "yeti",
    icon: "♜",
    augment: true,
  },
  {
    chapter: 2,
    type: "battle",
    title: "冰封长路",
    subtitle: "普通战斗",
    enemy: "wolf",
    icon: "⚔",
  },
  {
    chapter: 2,
    type: "battle",
    title: "风暴祭坛",
    subtitle: "章节首领",
    enemy: "nunu",
    icon: "♛",
    chapterBoss: true,
  },
  {
    chapter: 3,
    type: "battle",
    title: "黑冰回廊",
    subtitle: "普通战斗",
    enemy: "archer",
    icon: "❄",
  },
  {
    chapter: 3,
    type: "battle",
    title: "守卫者之径",
    subtitle: "普通战斗",
    enemy: "boar",
    icon: "♞",
  },
  {
    chapter: 3,
    type: "rest",
    title: "最后营火",
    subtitle: "随机机动强化",
    icon: "♨",
  },
  {
    chapter: 3,
    type: "battle",
    title: "监视者之门",
    subtitle: "精英战斗",
    enemy: "yeti",
    icon: "♜",
    augment: true,
  },
  {
    chapter: 3,
    type: "battle",
    title: "冰霜王座前",
    subtitle: "普通战斗",
    enemy: "wolf",
    icon: "⚔",
  },
  {
    chapter: 3,
    type: "battle",
    title: "冰霜王座",
    subtitle: "冰霜王座首领",
    enemy: "lissandra",
    icon: "♛",
    summitBoss: true,
  },
  {
    chapter: 4,
    type: "battle",
    title: "班德尔魔王殿",
    subtitle: "最终首领",
    enemy: "demonTeemo",
    icon: "☠",
    finalBoss: true,
  },
];

const augments = [
  {
    id: "giant",
    name: "巨人体质",
    rarity: "棱彩",
    icon: "⬢",
    text: "最大生命提高 20%，终极技能伤害提高 20%。",
  },
  {
    id: "echo",
    name: "虚空回响",
    rarity: "黄金",
    icon: "◈",
    text: "每回合第一张 Q 或 W 额外造成 7 点伤害。",
  },
  {
    id: "feastHeal",
    name: "凯旋盛宴",
    rarity: "黄金",
    icon: "◆",
    text: "终极技能完成斩杀后恢复 18% 最大生命。",
  },
  {
    id: "energyCore",
    name: "高能电池",
    rarity: "棱彩",
    icon: "●",
    text: "每回合最大能量与恢复能量 +1。",
  },
  {
    id: "quickRupture",
    name: "技能电容",
    rarity: "黄金",
    icon: "△",
    text: "Q 的能量消耗降低 1，最低为 0。",
  },
  {
    id: "frostSkin",
    name: "寒霜外壳",
    rarity: "白银",
    icon: "⬡",
    text: "每场战斗开始时获得最大生命 12% 的护盾。",
  },
  {
    id: "thornBody",
    name: "尖刺防御",
    rarity: "白银",
    icon: "✦",
    text: "每次受到敌人伤害后，反击 5 点伤害。",
  },
  {
    id: "secondWind",
    name: "复苏之风",
    rarity: "黄金",
    icon: "≈",
    text: "每个敌人回合结束后恢复 4 点生命。",
  },
  {
    id: "execution",
    name: "终极裁决",
    rarity: "棱彩",
    icon: "◉",
    text: "强化终极技能对残血敌人的终结能力。",
  },
  { id: "firstStrike", name: "先发锋芒", rarity: "黄金", icon: "➤", text: "每回合第一张造成伤害的牌，总伤害提高 20%。" },
  { id: "lastStand", name: "孤注一掷", rarity: "棱彩", icon: "◉", text: "打出一张牌并耗尽能量时，该牌总伤害提高 25%。" },
  { id: "disruptor", name: "破法回路", rarity: "黄金", icon: "⌁", text: "每回合首次成功打断特殊行动，额外造成 8 点伤害并恢复 1 能量。" },
  { id: "controlFlow", name: "冰封连锁", rarity: "黄金", icon: "❄", text: "每回合首次成功眩晕敌人，抽 1 张牌。" },
  { id: "tacticalHand", name: "战术手牌", rarity: "白银", icon: "▣", text: "每场战斗的初始手牌增加 1 张，仍不超过 8 张。" },
  { id: "patientGuard", name: "寒冬守势", rarity: "黄金", icon: "⬡", text: "结束回合时若保留至少 4 张手牌，敌人行动前获得最大生命 10% 的护盾。" },
  { id: "bloodEmpire", name: "血流成河", rarity: "黄金", icon: "✦", champions: ["darius"], text: "流血上限提高至 7 层，每层流血伤害 +1。" },
  { id: "conqueror", name: "征服者", rarity: "棱彩", icon: "⚔", champions: ["darius"], text: "每连续使用一张牌获得1层征服；每层使伤害+4%，回合结束清空。" },
  { id: "dunkMaster", name: "断头台大师", rarity: "黄金", icon: "◆", champions: ["darius"], text: "R 对满层流血敌人伤害提高35%，斩杀后抽1张。" },
  { id: "overclock", name: "超频机枪", rarity: "棱彩", icon: "⇈", champions: ["jinx"], text: "机枪达到3层后，每次普攻抽1张；每回合最多2次。" },
  { id: "luckyCrit", name: "幸运暴击", rarity: "黄金", icon: "✹", champions: ["jinx", "darius"], text: "获得20%暴击率；每次暴击恢复1能量，每回合一次。" },
  { id: "artillery", name: "超远火力", rarity: "黄金", icon: "➶", champions: ["jinx"], text: "W与R获得6点穿甲，并对满护盾敌人造成20%额外伤害。" },
  { id: "thickSkin", name: "无底胃囊", rarity: "棱彩", icon: "⬢", champions: ["tahmkench"], text: "每次吞噬斩杀额外永久增加4%最大生命。" },
  { id: "abyssMagic", name: "深渊魔力", rarity: "黄金", icon: "◈", champions: ["tahmkench"], text: "每20点最大生命提供1AP；Q与W对满层品味目标+25%伤害。" },
  { id: "shieldBash", name: "盾击", rarity: "黄金", icon: "⬡", champions: ["tahmkench"], text: "获得护盾时，下一次普攻附加护盾值40%的伤害。" },
];

const seededRewardScore = (id, seed) => {
  let hash = seed >>> 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = Math.imul(hash ^ id.charCodeAt(i), 2654435761) >>> 0;
  }
  hash ^= hash >>> 16;
  return hash >>> 0;
};

const defaultRun = (championId = "cho") => {
  const champion = championRoster[championId];
  let jinxQKept = false;
  const championDeck = championId === "jinx"
    ? starterDeck.map((id) => {
        if (id !== "q") return id;
        if (!jinxQKept) {
          jinxQKept = true;
          return id;
        }
        return "attack";
      })
    : starterDeck;
  return {
    championId,
    hero: {
      hp: champion.hp,
      maxHp: champion.hp,
      ad: champion.ad,
      ap: champion.ap,
      feast: 0,
    },
    gold: 8,
    deck: [...championDeck],
    gear: [],
    augments: [],
    upgrades: { attack: 0, q: 0, w: 0, e: 0, r: 0 },
    shopRoll: 0,
    lastShopStock: [],
    rewardSeed: Math.floor(Math.random() * 0x7fffffff),
    node: 0,
  };
};

function Home({ onEnter }) {
  return (
    <main className="home-shell">
      <button className="back-button" onClick={() => { window.location.href = "./"; }}>← 返回海克斯模拟器</button>
      <nav className="topbar">
        <div className="brand">
          <span className="brand-mark">H</span>
          <span>HEXTECH ARAM</span>
        </div>
        <div className="nav-meta">
          <span className="status-dot" /> 本地原型 · 装备构筑版
        </div>
      </nav>
      <section className="home-hero">
        <div className="eyebrow">新的远征已经开启</div>
        <h1>选择你的战场</h1>
        <p>用英雄的五种招式与五件成装，构筑属于你的战斗体系。</p>
      </section>
      <section className="mode-grid">
        <button className="mode-card journey-card" onClick={onEnter}>
          <div className="aurora" />
          <div className="mode-content">
            <span className="mode-tag">ROGUELIKE · 英雄技能构筑</span>
            <div className="frost-rune">ᚠ</div>
            <h2>弗雷尔卓德之旅</h2>
            <p>
              每场战斗后从三件完整装备中购买一件，让普攻、Q、W、E、R组成独特连招。
            </p>
            <div className="mode-details">
              <span>五种英雄牌</span>
              <i />
              <span>五件成装</span>
              <i />
              <span>危险意图</span>
            </div>
            <span className="primary-cta">
              进入旅程 <b>→</b>
            </span>
          </div>
          <div className="mountains">
            <span />
            <span />
            <span />
          </div>
        </button>
        <article className="mode-card locked-card">
          <span className="locked-icon">⌁</span>
          <span className="mode-tag">敬请期待</span>
          <h3>更多英雄</h3>
          <p>卡牌大师与德莱厄斯仍在准备远征。</p>
        </article>
      </section>
    </main>
  );
}

function FrozenIntro({ onComplete }) {
  const [leaving, setLeaving] = useState(false);
  const finish = useCallback(() => {
    if (leaving) return;
    setLeaving(true);
    window.setTimeout(onComplete, 650);
  }, [leaving, onComplete]);

  useEffect(() => {
    const timer = window.setTimeout(finish, 3600);
    return () => window.clearTimeout(timer);
  }, [finish]);

  return (
    <main
      className={`frozen-intro ${leaving ? "is-leaving" : ""}`}
      onClick={finish}
      role="button"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") finish();
      }}
      aria-label="跳过弗雷尔卓德开场动画"
    >
      <div className="intro-aurora" aria-hidden="true" />
      <div className="intro-snow" aria-hidden="true" />
      <div className="intro-frost intro-frost-left" aria-hidden="true" />
      <div className="intro-frost intro-frost-right" aria-hidden="true" />
      <div className="intro-ice-seal" aria-hidden="true"><span>ᚠ</span></div>
      <div className="intro-title">
        <small>THE FRELJORD AWAITS</small>
        <h1>弗雷尔卓德</h1>
        <p>寒冰封境，远征者苏醒</p>
      </div>
      <span className="intro-skip">点击任意位置跳过</span>
    </main>
  );
}

function Lobby({ onBack, onStart, standalone = false }) {
  const [selected, setSelected] = useState("cho");
  const champion = championRoster[selected];
  const guide = championGuides[selected];
  return (
    <main className={`journey-shell ${standalone ? "standalone-journey" : ""}`}>
      {standalone && (
        <div className="polar-atmosphere" aria-hidden="true">
          <span className="aurora-band aurora-one" />
          <span className="aurora-band aurora-two" />
          <span className="ice-moon" />
          <span className="frozen-range frozen-range-back" />
          <span className="frozen-range frozen-range-front" />
          <span className="snowfall snow-near" />
          <span className="snowfall snow-far" />
        </div>
      )}
      {!standalone && (
        <button className="back-button" onClick={onBack}>
          ← 返回首页
        </button>
      )}
      <header className="journey-header compact-heading">
        <div className="eyebrow">FRELJORD EXPEDITION · 极北远征</div>
        <h1>{standalone ? "踏入弗雷尔卓德" : "选择远征英雄"}</h1>
        <p>{standalone ? "寒风会埋葬弱者，冰原只铭记胜利者。选择英雄，向霜寒王座进发。" : "每名英雄只使用普攻与四个原生技能，并拥有独立战斗机制。"}</p>
        {standalone && <div className="frost-divider"><i /> ᚠ <i /></div>}
      </header>
      <section className="champion-roster">
        {Object.values(championRoster).map((item) => (
          <button
            key={item.id}
            className={`champion-choice ${selected === item.id ? "selected" : ""}`}
            style={{ "--champion-color": item.color }}
            onClick={() => setSelected(item.id)}
          >
            <img src={item.image} alt={item.name} />
            <span>
              <small>{item.role}</small>
              <b>{item.name}</b>
              <em>{item.mechanic}</em>
            </span>
          </button>
        ))}
      </section>
      <section className="journey-layout hero-detail-layout">
        <div
          className="champion-card selected"
          style={{ "--champion-color": champion.color }}
        >
          <span className="available-tag">已选择</span>
          <div className="champion-art lobby-cho">
            <img src={champion.image} alt={champion.name} />
          </div>
          <div className="champion-copy">
            <span className="role">{champion.role}</span>
            <h2>{champion.name}</h2>
            <p>{champion.description}</p>
            <div className="build-tags">
              {champion.builds.map((build) => (
                <span key={build}>{build}</span>
              ))}
            </div>
          </div>
        </div>
        <aside className="run-panel">
          <div className="chapter-line">
            <span>三章远征</span>
            <b>冰霜王座</b>
          </div>
          <h3>{champion.mechanic}</h3>
          <div className="mechanic-guide compact-mechanic-guide">
            <span><b>核心玩法</b><p>{guide.loop}</p></span>
            <span><b>关键机制</b><p>{guide.control}</p></span>
          </div>
          <div className="run-stats">
            <span>
              <small>初始生命</small>
              {champion.hp}
            </span>
            <span>
              <small>初始攻击</small>
              {champion.ad}
            </span>
            <span>
              <small>初始法强</small>
              {champion.ap}
            </span>
          </div>
          <button className="start-button" onClick={() => onStart(selected)}>
            以 {champion.name} 开始 <span>→</span>
          </button>
        </aside>
      </section>
    </main>
  );
}

function Header({ run, onQuit, label, showAugments = true }) {
  const chapter = route[Math.min(run.node, route.length - 1)]?.chapter || 1;
  return (
    <>
      <header className="battle-topbar">
        <button className="back-button compact" onClick={onQuit}>
          ← 放弃旅程
        </button>
        <div className="route-title">
          <small>
            第 {chapter} 章 · 第 {Math.min(run.node + 1, route.length)}/
            {route.length} 层
          </small>
          <b>{label}</b>
        </div>
        <div className="currencies">
          <span>◈ {run.gold}</span>
          <span>
            生命 {run.hero.hp}/{run.hero.maxHp}
          </span>
        </div>
      </header>
      {showAugments && label !== "冰原路线" && run.augments.length > 0 && (
        <AugmentBar owned={run.augments} />
      )}
    </>
  );
}

function EquipmentBar({ gear, detailed = false }) {
  const [activeItem, setActiveItem] = useState(null);
  const selectedItem = activeItem ? equipment[activeItem] : null;

  return (
    <div className="equipment-bar">
      {Array.from({ length: 5 }, (_, i) => {
        const item = equipment[gear[i]];
        return (
          <button
            type="button"
            key={i}
            className={`equipment-slot ${item ? "filled" : ""} ${activeItem === item?.id ? "active" : ""}`}
            title={item?.text || "空装备栏"}
            disabled={!item}
            onClick={() => detailed && setActiveItem(activeItem === item.id ? null : item.id)}
          >
            {item ? <img src={item.image} alt="" /> : <strong>＋</strong>}
            <span>{item?.name || "空"}</span>
          </button>
        );
      })}
      {detailed && selectedItem && (
        <div className="equipment-detail" role="status">
          <img src={selectedItem.image} alt="" />
          <div>
            <b>{selectedItem.name}</b>
            <small>{equipmentStats(selectedItem).join(" · ") || "特殊效果装备"}</small>
            <span>{selectedItem.text}</span>
          </div>
          <button type="button" onClick={() => setActiveItem(null)} aria-label="关闭装备说明">×</button>
        </div>
      )}
    </div>
  );
}

function AugmentBar({ owned }) {
  return (
    <div className="owned-augments">
      {owned.length ? (
        owned.map((id) => {
          const item = augments.find((a) => a.id === id);
          return (
            <div
              key={id}
              className={`owned-augment rarity-${item.rarity}`}
              title={item.text}
            >
              <strong>{item.icon}</strong>
              <span>{item.name}</span>
            </div>
          );
        })
      ) : (
        <span className="no-augment">尚未获得海克斯</span>
      )}
    </div>
  );
}

function Map({ run, onChoose, onQuit }) {
  const current = route[run.node];
  const chapterNames = ["冰原荒野", "部族领地", "冰霜王座", "提莫大魔王挑战"];
  const chapterNodes = route
    .map((node, i) => ({ ...node, index: i }))
    .filter((node) => node.chapter === current?.chapter);
  const currentChapterIndex = Math.max(
    0,
    chapterNodes.findIndex((node) => node.index === run.node),
  );
  useEffect(() => {
    if (!current) return undefined;
    const timer = setTimeout(() => onChoose(current), 2800);
    return () => clearTimeout(timer);
  }, [current, onChoose]);
  return (
    <main className={`map-shell transition-map ${current?.chapter === 4 ? "final-challenge-map" : ""}`}>
      <Header run={run} onQuit={onQuit} label="旅程推进" showAugments={false} />
      <section className="map-heading">
        <div className="eyebrow">CHAPTER {current?.chapter}</div>
        <h1>{chapterNames[(current?.chapter || 1) - 1]}</h1>
        <p>正在前往：{current?.title}</p>
      </section>
      <EquipmentBar gear={run.gear} />
      <AugmentBar owned={run.augments} />
      <section className="route-track chapter-track">
        <div className="route-line" />
        <div
          className="route-hero-walker"
          style={{
            "--walker-from-x": `${5 + (Math.max(0, currentChapterIndex - 1) / Math.max(1, chapterNodes.length - 1)) * 90}%`,
            "--walker-to-x": `${5 + (currentChapterIndex / Math.max(1, chapterNodes.length - 1)) * 90}%`,
            "--walker-row": chapterNodes.length - currentChapterIndex,
            "--walker-start-shift": current?.chapter === 4 ? "240px" : currentChapterIndex === 0 ? "0px" : "calc(100% + 5px)",
            "--walker-mid-shift": current?.chapter === 4 ? "120px" : currentChapterIndex === 0 ? "0px" : "50%",
          }}
          aria-label={`${championRoster[run.championId].name}正在前往${current?.title}`}
        >
          <img src={championRoster[run.championId].image} alt="" />
        </div>
        {chapterNodes.map((node, chapterIndex) => (
          <div
            key={`${node.index}-${node.title}`}
            className={`route-node ${node.index < run.node ? "done" : ""} ${node.index === run.node ? "current" : ""} ${node.chapterBoss || node.summitBoss || node.finalBoss ? "boss-node" : ""}`}
            style={{ "--route-order": chapterNodes.length - chapterIndex }}
          >
            <span className="route-index">{node.index + 1}</span>
            <strong>{node.icon}</strong>
            <b>{node.title}</b>
            <small>{node.index < run.node ? "已完成" : node.subtitle}</small>
          </div>
        ))}
      </section>
      <div className="auto-progress">
        <i />
        <span>自动进入下一阶段</span>
      </div>
    </main>
  );
}

function shuffleDeck(cards) {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  for (let i = 3; i < shuffled.length; i += 1) {
    const fourAttacks = shuffled.slice(i - 3, i + 1).every((card) => card === "attack");
    if (!fourAttacks) continue;
    const nextSkill = shuffled.findIndex((card, index) => index > i && card !== "attack");
    if (nextSkill !== -1) [shuffled[i], shuffled[nextSkill]] = [shuffled[nextSkill], shuffled[i]];
  }
  return shuffled;
}

function draw(pile, discard, count) {
  let p = [...pile],
    d = [...discard];
  if (p.length < count) {
    p = shuffleDeck([...p, ...d]);
    d = [];
  }
  return { cards: p.slice(0, count), pile: p.slice(count), discard: d };
}

function Battle({ run, enemyId, onWin, onLose, onQuit }) {
  const champion = championRoster[run.championId || "cho"];
  const skillSet = champion.skills;
  const template = enemies[enemyId];
  const chapter = route[run.node]?.chapter || 1;
  const battleNodes = route.filter((routeNode) => routeNode.type === "battle");
  const battleIndex = route
    .slice(0, run.node + 1)
    .filter((routeNode) => routeNode.type === "battle").length - 1;
  const battleProgress = battleIndex / Math.max(1, battleNodes.length - 1);

  // Opening fights teach the deck; the back half checks whether the build has come together.
  // Power now curves upward by battle instead of jumping sharply at chapter boundaries.
  const hpScale = 0.7 + Math.pow(battleProgress, 1.55) * 4.42;
  const offenseScale = 0.7 + Math.pow(battleProgress, 1.35) * 1.15;
  const sustainScale = 0.75 + Math.pow(battleProgress, 1.5) * 2.55;
  const hpRankScale = template.demonBoss ? 0.86 : template.finalBoss ? 0.82 : template.boss ? 1.08 : template.elite ? 1.12 : 1;
  const offenseRankScale = template.demonBoss ? 0.9 : template.finalBoss ? 0.8 : template.boss ? 1 : template.elite ? 1.05 : 1;
  const scaleAction = (action) => {
    const scaled = {
      ...action,
      damage: action.damage ? Math.round(action.damage * offenseScale * offenseRankScale * (action.dangerous ? 1 : 1.2)) : action.damage,
      charge: action.charge ? Math.round(action.charge * offenseScale * offenseRankScale) : action.charge,
      buff: action.buff ? Math.round(action.buff * offenseScale) : action.buff,
      shield: action.shield ? Math.round(action.shield * sustainScale * hpRankScale) : action.shield,
      heal: action.heal ? Math.round(action.heal * sustainScale * hpRankScale) : action.heal,
    };
    if (scaled.charge) scaled.text = `蓄力 ${scaled.charge} 点伤害；可被打断`;
    else if (scaled.damage) scaled.text = `造成 ${scaled.damage} 点伤害${scaled.drain ? `，下回合能量 -${scaled.drain}` : ""}${scaled.blind ? `，施加${scaled.blind}次致盲` : ""}`;
    else if (scaled.buff) scaled.text = `永久增加 ${scaled.buff} 点攻击；可被沉默`;
    else if (scaled.shield) scaled.text = `获得 ${scaled.shield} 点护盾；可被沉默`;
    else if (scaled.heal) scaled.text = `恢复 ${scaled.heal} 点生命；可被沉默`;
    return scaled;
  };
  const base = {
    ...template,
    hp: Math.round(template.hp * hpScale * hpRankScale),
    gold: Math.round(template.gold * (1 + (chapter - 1) * 0.38)),
    actions: template.actions.map(scaleAction),
  };
  const deck = useMemo(() => shuffleDeck(run.deck), [run.deck]);
  const bonusLife = run.hero.maxHp - champion.hp;
  let combatAp =
    run.hero.ap +
    (run.gear.includes("riftmaker") ? Math.floor(bonusLife / 10) : 0);
  if (run.augments.includes("abyssMagic")) combatAp += Math.floor(run.hero.maxHp / 20);
  if (run.gear.includes("dawncore")) {
    const shieldItems = run.gear.filter((id) => equipment[id].tags.includes("护盾")).length;
    combatAp = Math.round(combatAp * (1 + shieldItems * 0.08));
  }
  if (run.gear.includes("rabadon")) combatAp = Math.round(combatAp * 1.3);
  const runeEnergy = run.augments.includes("energyCore") ? 1 : 0;
  const campEnergy = run.hero.energyBonus || 0;
  const startingShield = run.augments.includes("frostSkin")
    ? Math.round(run.hero.maxHp * 0.12)
    : 0;
  const maxTenacity = base.elite || base.boss || base.finalBoss ? 2 : 1;
  const [hero, setHero] = useState({
    ...run.hero,
    ap: combatAp,
    shield: startingShield,
    energy: 3 + runeEnergy + campEnergy,
    maxEnergy: 3 + runeEnergy + campEnergy,
    turn: 1,
    eCharges: 0,
    lichReady: false,
    lichUsed: false,
    spells: 0,
    heartsteelUsed: false,
    icebornReady: false,
    jakshoUsed: false,
    bansheeReady: run.gear.includes("banshee"),
    burn: 0,
    drained: 0,
    empowered: false,
    selectedCard: null,
    trickCharges: 0,
    weapon: "机枪",
    minigun: 0,
    grayDamage: 0,
    crit: (run.hero.crit || 0) + (run.augments.includes("luckyCrit") ? 20 : 0),
    armorPen: run.hero.armorPen || 0,
    critMeter: run.hero.critMeter || 0,
    attacks: 0,
    basicCards: 0,
    drawsTurn: 0,
    shojinCasts: 0,
    essenceUsed: false,
    pokeUsed: false,
    axiomUsed: false,
    conqueror: 0,
    shieldBash: 0,
    bonusDraw: 0,
    trinityReady: false,
    trinityUsed: false,
    spellsTurn: 0,
    cosmicUsed: false,
    hexplateUsed: false,
    frozenheartUsed: false,
    firstStrikeUsed: false,
    disruptorUsed: false,
    controlFlowUsed: false,
  });
  const [foe, setFoe] = useState({
    hp: base.hp,
    maxHp: base.hp,
    shield: chapter === 3
      ? Math.round(base.hp * (base.finalBoss ? 0.08 : 0.12))
      : 0,
    turn: 0,
    bonus: 0,
    interrupted: false,
    stunned: false,
    stunProgress: 0,
    controlWard: false,
    silenced: false,
    bleed: 0,
    taste: 0,
    marked: false,
    frostPower: 0,
    blind: 0,
  });
  const openingHandSize = Math.min(8, 5 + (run.hero.openingDraw || 0) + (run.augments.includes("tacticalHand") ? 1 : 0));
  const [hand, setHand] = useState(deck.slice(0, openingHandSize));
  const [pile, setPile] = useState(deck.slice(openingHandSize));
  const [discard, setDiscard] = useState([]);
  const [log, setLog] = useState([
    `遭遇${base.name}。危险行动需要用Q或W处理。`,
  ]);
  const [locked, setLocked] = useState(false);
  const [damagePopup, setDamagePopup] = useState(null);
  const [cardChoice, setCardChoice] = useState(null);
  const intent = base.actions[foe.turn % base.actions.length];
  const nextIntent = base.actions[(foe.turn + 1) % base.actions.length];
  const heartsteelReady =
    run.gear.includes("heartsteel") && hero.turn >= 2 && !hero.heartsteelUsed;

  const previewDamage = (id, startingDamage, options = {}) => {
    const isBasicAttack = options.isBasicAttack ?? id === "attack";
    const isSpell = id !== "attack";
    const canCrit = isBasicAttack ||
      (champion.id === "darius" && id === "r") ||
      (champion.id === "jinx" && (id === "w" || id === "r"));
    let damage = startingDamage;

    if (champion.id !== "cho" && id === "r" && run.augments.includes("giant"))
      damage = Math.round(damage * 1.2);
    if (champion.id !== "cho" && id === "r" && run.augments.includes("execution") && foe.hp / foe.maxHp < 0.4)
      damage = Math.round(damage * 1.2);
    if (champion.id === "darius" && run.gear.includes("cleaver")) {
      const bleedCap = run.augments.includes("bloodEmpire") ? 7 : 5;
      const bleed = options.bleed ?? foe.bleed;
      damage = Math.round(damage * (1 + bleed * 0.03 + (bleed >= bleedCap ? 0.1 : 0)));
    }
    if (champion.id === "darius" && id === "r" && foe.bleed >= (run.augments.includes("bloodEmpire") ? 7 : 5) && run.augments.includes("dunkMaster"))
      damage = Math.round(damage * 1.35);
    if (champion.id === "tahmkench" && foe.taste >= 3 && (id === "q" || id === "w") && run.augments.includes("abyssMagic"))
      damage = Math.round(damage * 1.25);
    if (champion.id === "jinx" && (id === "w" || id === "r")) {
      if (run.gear.includes("manamune")) damage += 4 * (hero.energy - (skillSet[id].cost || 0));
      if (run.gear.includes("youmuu") && !hero.pokeUsed) damage += 8;
      if (run.augments.includes("artillery") && foe.shield >= foe.maxHp * 0.1) damage = Math.round(damage * 1.2);
    }
    if (canCrit && hero.crit > 0 && hero.critMeter + hero.crit >= 100)
      damage = Math.round(damage * (run.gear.includes("infinity") ? 2.25 : 1.75));
    if (run.augments.includes("conqueror"))
      damage = Math.round(damage * (1 + Math.min(5, hero.conqueror + 1) * 0.04));
    if (hero.armorPen && damage > 0) damage += Math.min(hero.armorPen, foe.shield);

    if (isBasicAttack) {
      if (run.gear.includes("titanic")) damage += Math.round(hero.maxHp * 0.04);
      if (run.gear.includes("nashor")) damage += Math.round(2 + hero.ap * 0.4);
      if (hero.lichReady) damage += Math.round(5 + hero.ap);
      if (hero.icebornReady) damage += Math.round(hero.maxHp * 0.07);
      if (heartsteelReady) damage += Math.round(hero.maxHp * 0.08);
      if (run.gear.includes("kraken") && (hero.attacks + 1) % 3 === 0)
        damage += Math.round(14 + hero.ad * 0.8);
      if (id === "attack" && run.gear.includes("guinsoo") && (hero.basicCards + 1) % 3 === 0)
        damage += Math.round(8 + hero.ad * 0.5);
      if (id === "attack" && hero.trinityReady) damage += Math.round(6 + hero.ad * 0.7);
      if (hero.shieldBash > 0) damage += hero.shieldBash;
      if (run.gear.includes("bork")) damage += Math.max(1, Math.round(foe.hp * 0.05));
    }
    if (run.gear.includes("shadowflame") && foe.hp / foe.maxHp < 0.4 && (id === "q" || id === "w"))
      damage = Math.round(damage * 1.2);
    if (run.gear.includes("horizon") && (intent.dangerous || intent.charge) && (id === "q" || id === "w"))
      damage = Math.round(damage * 1.25);
    if (isSpell) {
      if (run.gear.includes("luden") && (hero.spells + 1) % 3 === 0)
        damage += Math.round(10 + hero.ap * 0.6);
      if (run.gear.includes("riftmaker") && hero.turn >= (run.gear.includes("jaksho") ? 3 : 4))
        damage = Math.round(damage * 1.15);
      if (run.augments.includes("echo") && hero.spells === 0 && (id === "q" || id === "w"))
        damage += 7;
    }
    const previewCost = id === "q" && run.augments.includes("quickRupture")
      ? Math.max(0, skillSet[id].cost - 1)
      : skillSet[id].cost;
    if (damage > 0 && run.augments.includes("firstStrike") && !hero.firstStrikeUsed)
      damage = Math.round(damage * 1.2);
    if (damage > 0 && run.augments.includes("lastStand") && hero.energy - previewCost === 0)
      damage = Math.round(damage * 1.25);
    return Math.max(0, Math.round(damage * HERO_DAMAGE_SCALE));
  };

  const attemptStun = (target, power = 1) => {
    if (target.controlWard) {
      target.controlWard = false;
      return "immune";
    }
    target.stunProgress += power;
    if (target.stunProgress >= maxTenacity) {
      target.stunned = true;
      target.stunProgress = 0;
      if (base.finalBoss) target.controlWard = true;
      return "stunned";
    }
    return "resisted";
  };

  const skillPreview = (id) => {
    const level = run.upgrades[id];
    if (champion.id === "darius") {
      const bleedCap = run.augments.includes("bloodEmpire") ? 7 : 5;
      if (id === "attack") {
        const nextBleed = Math.min(bleedCap, foe.bleed + (hero.empowered ? 2 : 1));
        const damage = previewDamage(id, hero.ad + level * 2 + (hero.empowered ? 8 + level * 2 : 0), { bleed: nextBleed });
        return `造成 ${damage} 点伤害，流血 ${foe.bleed}/${bleedCap} → ${nextBleed}/${bleedCap}。`;
      }
      if (id === "q") {
        const nextBleed = Math.min(bleedCap, foe.bleed + 1);
        const damage = previewDamage(id, Math.round(10 + hero.ad * 0.9 + level * 4), { bleed: nextBleed });
        const healing = Math.round(hero.maxHp * 0.08 * (run.gear.includes("visage") ? 1.5 : 1));
        return `造成 ${damage} 点伤害，恢复 ${Math.min(hero.maxHp - hero.hp, healing)} 生命并施加1层流血；流血 ${foe.bleed}/${bleedCap} → ${nextBleed}/${bleedCap}。`;
      }
      if (id === "w") {
        const nextBleed = Math.min(bleedCap, foe.bleed + 2);
        return `立即造成 ${previewDamage(id, hero.ad + 8 + level * 4, { isBasicAttack: true, bleed: nextBleed })} 点强化普攻伤害，流血 ${foe.bleed}/${bleedCap} → ${nextBleed}/${bleedCap}。`;
      }
      if (id === "e") return `打断「${intent.name}」；敌人改用普通攻击。`;
      return `造成 ${previewDamage(id, Math.round(12 + hero.ad + foe.bleed * 6 + level * 5))} 点伤害（${foe.bleed}层流血）${foe.bleed >= bleedCap ? "，打出后立即将这张 R 返回手牌" : ""}。`;
    }
    if (champion.id === "twistedfate") {
      if (id === "attack") {
        const cardBonus = hero.empowered && hero.selectedCard === "红牌" ? Math.round(7 + hero.ap * 0.55) : 0;
        const trickBonus = hero.trickCharges ? Math.round(4 + hero.ap * 0.45) : 0;
        return `造成 ${previewDamage(id, hero.ad + level * 2 + cardBonus + trickBonus)} 点伤害${hero.empowered ? `，打出${hero.selectedCard}` : ""}。`;
      }
      if (id === "q")
        return `造成 ${previewDamage(id, Math.round((9 + level * 4 + hero.ap) * (foe.marked ? 1.5 : 1)))} 点伤害${foe.marked ? "并消耗命运标记" : ""}。`;
      if (id === "w")
        return "三选一：蓝牌恢复2能量、红牌额外造成伤害、金牌施加眩晕；所选牌替换下一张A。";
      if (id === "e") return `获得 ${2 + Math.floor(level / 2)} 层卡牌骗术，后续每次普攻附加 ${Math.round(4 + hero.ap * 0.45)} 点伤害。`;
      return `造成 ${previewDamage(id, Math.round(5 + hero.ap * 0.4 + level * 2))} 点伤害，标记敌人并使下一次万能牌伤害提高50%，抽2张牌。`;
    }
    if (champion.id === "jinx") {
      if (id === "attack")
        return `使用${hero.weapon}造成 ${previewDamage(id, Math.round(hero.ad + level * 2 + (hero.weapon === "机枪" ? hero.minigun * 2 : 6 + hero.ad * 0.5)))} 点伤害。`;
      if (id === "q")
        return `切换为${hero.weapon === "机枪" ? "火箭发射器（普攻重击）" : "机枪（连续普攻成长）"}。`;
      if (id === "w")
        return `造成 ${previewDamage(id, Math.round(10 + level * 4 + hero.ad * 0.9))} 点伤害并标记敌人。`;
      if (id === "e") return `眩晕敌人；本回合完全无法行动。当前韧性 ${foe.stunProgress}/${maxTenacity}。`;
      return `造成 ${previewDamage(id, Math.round(14 + level * 5 + hero.ad + (1 - foe.hp / foe.maxHp) * 36))} 点伤害；敌人越残血伤害越高。`;
    }
    if (champion.id === "tahmkench") {
      if (id === "attack")
        return `造成 ${previewDamage(id, hero.ad + level * 2)} 点伤害，品味 ${foe.taste}/3 → ${Math.min(3, foe.taste + 1)}/3。`;
      if (id === "q")
      return `造成 ${previewDamage(id, Math.round(8 + level * 4 + hero.ap * 0.8))} 点伤害${foe.taste >= 3 ? "，消耗3层品味并眩晕" : "；未满3层不会眩晕"}。`;
      if (id === "w")
        return `造成 ${previewDamage(id, Math.round(11 + level * 4 + hero.ap * 0.7))} 点伤害并打断蓄力。`;
      if (id === "e")
        {
          const baseShield = Math.round(Math.max(hero.maxHp * 0.12, hero.grayDamage * 0.7));
          const shieldItems = run.gear.filter((gearId) => equipment[gearId].tags.includes("护盾")).length;
          const shield = Math.round(baseShield * (run.gear.includes("moonstone") ? 1.35 : 1) * (run.gear.includes("dawncore") ? 1 + shieldItems * 0.08 : 1));
          return `获得 ${shield} 点护盾${run.gear.includes("moonstone") ? `并恢复 ${Math.min(hero.maxHp - hero.hp, Math.round(shield * 0.2))} 生命` : ""}。`;
        }
      const executeRatio = base.boss || base.finalBoss
        ? Math.min(0.16, 0.08 + level * 0.02)
        : Math.min(0.28, 0.18 + level * 0.03);
      const threshold = Math.round(foe.maxHp * executeRatio);
      const baseDamage = Math.round(14 + level * 5 + hero.maxHp * 0.08 + hero.ap * 0.6);
      const damage = foe.taste >= 3 ? Math.round(baseDamage * 1.35) : baseDamage;
      const preview = previewDamage(id, damage);
      const actual = foe.hp / foe.maxHp <= executeRatio ? Math.max(preview, foe.hp + foe.shield) : preview;
      return `造成 ${actual} 点伤害${foe.taste >= 3 ? "（消耗3层品味，伤害+35%）" : ""}；生命≤${threshold}时吞噬斩杀。`;
    }
    if (id === "attack") {
      let value = hero.ad + level * 2;
      const parts = [];
      if (hero.eCharges > 0) {
        const bonus = Math.round(4 + hero.maxHp * 0.03 + level * 2);
        value += bonus;
        parts.push(`E +${bonus}`);
      }
      return `造成 ${previewDamage(id, value)} 点伤害${parts.length ? `（${parts.join("、")}）` : ""}。`;
    }
    if (id === "e") {
      const charges = 2 + Math.floor(level / 2);
      const bonus = Math.round(4 + hero.maxHp * 0.03 + level * 2);
      return `接下来 ${charges} 次普攻各增加 ${bonus} 点伤害。`;
    }
    let damage =
      id === "q"
        ? 9 + level * 4 + hero.ap * 0.9
        : id === "w"
          ? 6 + level * 3 + hero.ap * 0.65
          : 16 + level * 5 + hero.maxHp * 0.06 + hero.ap * 0.7;
    if (id === "r" && run.augments.includes("giant")) damage *= 1.2;
    damage = previewDamage(id, Math.round(damage));
    if (id === "q")
      return `造成 ${damage} 点伤害并施加眩晕；敌人本回合无法行动。当前韧性 ${foe.stunProgress}/${maxTenacity}。`;
    if (id === "w") return `造成 ${damage} 点伤害并打断「${intent.name}」；敌人本回合改用普攻。`;
    const threshold = Math.round(
      foe.maxHp *
        (0.22 + level * 0.04 + (run.augments.includes("execution") ? 0.08 : 0)),
    );
    if (foe.hp <= threshold) damage = Math.max(damage, foe.hp + foe.shield);
    return `造成 ${damage} 点伤害。敌人生命 ≤ ${threshold} 时直接斩杀；成功斩杀永久最大生命 +8，无次数上限（已盛宴 ${hero.feast} 次）。`;
  };

  const damageFoe = (target, damage) => {
    const blocked = Math.min(target.shield, damage);
    return {
      ...target,
      shield: target.shield - blocked,
      hp: Math.max(0, target.hp - damage + blocked),
      dealt: damage - blocked,
    };
  };

  const play = (id, index, chosenCard = null) => {
    const actualCost =
      id === "q" && run.augments.includes("quickRupture")
        ? Math.max(0, skillSet[id].cost - 1)
        : skillSet[id].cost;
    if (locked || hero.energy < actualCost) return;
    const level = run.upgrades[id];
    let h = { ...hero, energy: hero.energy - actualCost };
    let f = { ...foe };
    const interruptedBefore = foe.interrupted;
    const stunnedBefore = foe.stunned;
    const tasteBefore = foe.taste;
    let damage = 0;
    let message = `使用「${skillSet[id].name}」。`;
    const isSpell = id !== "attack";
    const isBasicAttack = id === "attack" || (champion.id === "darius" && id === "w");
    const bleedCap = run.augments.includes("bloodEmpire") ? 7 : 5;
    const canCrit = isBasicAttack || (champion.id === "darius" && id === "r") || (champion.id === "jinx" && (id === "w" || id === "r"));

    if (id === "attack" && h.blind > 0) {
      h.blind -= 1;
      if (crypto.getRandomValues(new Uint8Array(1))[0] < 128) {
        const nextHand = hand.filter((_, i) => i !== index);
        setHero(h);
        setHand(nextHand);
        setDiscard([...discard, id]);
        setLog([`致盲生效，「${skillSet[id].name}」落空了。`]);
        return;
      }
    }

    if (champion.id === "darius") {
      if (id === "attack") {
        damage = h.ad + level * 2 + (h.empowered ? 8 + level * 2 : 0);
        f.bleed = Math.min(bleedCap, f.bleed + (h.empowered ? 2 : 1));
        h.empowered = false;
      }
      if (id === "q") {
        damage = Math.round(10 + h.ad * 0.9 + level * 4);
        f.bleed = Math.min(bleedCap, f.bleed + 1);
        const heal = Math.round(h.maxHp * 0.08 * (run.gear.includes("visage") ? 1.5 : 1));
        const healed = Math.min(h.maxHp - h.hp, heal);
        h.hp += healed;
        message += ` 恢复 ${healed} 点生命，并施加1层流血。`;
      }
      if (id === "w") {
        damage = h.ad + 8 + level * 4;
        f.bleed = Math.min(bleedCap, f.bleed + 2);
        message = "致残打击立即触发强化普攻，并施加2层流血。";
      }
      if (id === "e") {
        if (intent.dangerous || intent.charge || intent.buff || intent.heal || intent.shield) {
          f.interrupted = true;
          message = "无情铁手打断特殊行动；敌人将改用普攻。";
        } else message = "无情铁手命中，但基础攻击无法被打断。";
      }
      if (id === "r") {
        damage = Math.round(12 + h.ad + f.bleed * 6 + level * 5);
      }
    }
    if (champion.id === "twistedfate") {
      if (id === "attack") {
        damage = h.ad + level * 2;
        if (h.trickCharges) {
          damage += Math.round(4 + h.ap * 0.45);
          h.trickCharges -= 1;
        }
        if (h.empowered) {
          if (h.selectedCard === "蓝牌")
            h.energy = Math.min(h.maxEnergy, h.energy + 2);
          if (h.selectedCard === "红牌") damage += Math.round(7 + h.ap * 0.55);
          if (h.selectedCard === "金牌") {
            const result = attemptStun(f, 1);
            message += result === "stunned" ? " 金牌造成眩晕！" : result === "immune" ? " 控制被免疫。" : ` 韧性 ${f.stunProgress}/${maxTenacity}。`;
          }
          h.empowered = false;
          h.selectedCard = null;
        }
      }
      if (id === "q") {
        damage = Math.round((9 + level * 4 + h.ap) * (f.marked ? 1.5 : 1));
        f.marked = false;
      }
      if (id === "w") {
        h.empowered = true;
        h.selectedCard = chosenCard;
        message = `选中${h.selectedCard}，下一张A将替换为${h.selectedCard}。`;
      }
      if (id === "e") {
        h.trickCharges = 2 + Math.floor(level / 2);
        message = `获得 ${h.trickCharges} 层卡牌骗术。`;
      }
      if (id === "r") {
        damage = Math.round(5 + h.ap * 0.4 + level * 2);
        f.marked = true;
        h.destinyDraw = 2;
      }
    }
    if (champion.id === "jinx") {
      if (id === "attack") {
        damage = Math.round(
          h.ad +
            level * 2 +
            (h.weapon === "机枪" ? h.minigun * 2 : 6 + h.ad * 0.5),
        );
        if (h.weapon === "机枪") h.minigun = Math.min(3, h.minigun + 1);
      }
      if (id === "q") {
        h.weapon = h.weapon === "机枪" ? "火箭" : "机枪";
        h.minigun = 0;
        message = `切换为${h.weapon}。`;
      }
      if (id === "w") {
        damage = Math.round(10 + level * 4 + h.ad * 0.9);
        f.marked = true;
      }
      if (id === "e") {
        const result = attemptStun(f, 2);
        message = result === "stunned"
          ? "嚼火者眩晕敌人；敌人本回合完全无法行动！"
          : result === "immune"
            ? "嚼火者命中，但敌人免疫了本次眩晕。"
            : `嚼火者施加控制，韧性压力 ${f.stunProgress}/${maxTenacity}。`;
      }
      if (id === "r")
        damage = Math.round(14 + level * 5 + h.ad + (1 - f.hp / f.maxHp) * 36);
    }
    if (champion.id === "tahmkench") {
      if (id === "attack") {
        damage = h.ad + level * 2;
        f.taste = Math.min(3, f.taste + 1);
      }
      if (id === "q") {
        damage = Math.round(8 + level * 4 + h.ap * 0.8);
        if (f.taste >= 3) {
          f.taste = 0;
          const result = attemptStun(f, 2);
          message = result === "stunned" ? "巨舌鞭笞消耗品味并眩晕敌人！" : "巨舌鞭笞被控制免疫抵挡！";
        }
      }
      if (id === "w") {
        damage = Math.round(11 + level * 4 + h.ap * 0.7);
        if (intent.charge || intent.dangerous) f.interrupted = true;
      }
      if (id === "e") {
        const shield = Math.round(Math.max(h.maxHp * 0.12, h.grayDamage * 0.7));
        const shieldItems = run.gear.filter((gearId) => equipment[gearId].tags.includes("护盾")).length;
        const amplified = Math.round(shield * (run.gear.includes("moonstone") ? 1.35 : 1) * (run.gear.includes("dawncore") ? 1 + shieldItems * 0.08 : 1));
        h.shield += amplified;
        if (run.gear.includes("moonstone")) h.hp = Math.min(h.maxHp, h.hp + Math.round(amplified * 0.2));
        if (run.augments.includes("shieldBash")) h.shieldBash = Math.round(amplified * 0.4);
        h.grayDamage = 0;
        message = `厚实表皮获得 ${amplified} 点护盾。`;
      }
      if (id === "r") {
        damage = Math.round(14 + level * 5 + h.maxHp * 0.08 + h.ap * 0.6);
        if (tasteBefore >= 3) {
          damage = Math.round(damage * 1.35);
          f.taste = 0;
          message = "大快朵颐消耗3层品味，伤害提高35%。";
        }
        const executeLine = base.boss || base.finalBoss
          ? Math.min(0.16, 0.08 + level * 0.02)
          : Math.min(0.28, 0.18 + level * 0.03);
        const execute = f.hp / f.maxHp <= executeLine;
        if (execute) damage = Math.max(damage, f.hp + f.shield);
      }
    }

    if (champion.id !== "cho" && id === "r" && run.augments.includes("giant"))
      damage = Math.round(damage * 1.2);
    if (
      champion.id !== "cho" &&
      id === "r" &&
      run.augments.includes("execution") &&
      f.hp / f.maxHp < 0.4
    )
      damage = Math.round(damage * 1.2);
    if (f.interrupted && run.gear.includes("iceborn")) h.icebornReady = true;
    if (f.interrupted && run.gear.includes("fimbulwinter")) {
      const shield = Math.round(h.maxHp * 0.1); h.shield += shield;
      if (run.augments.includes("shieldBash")) h.shieldBash = Math.round(shield * 0.4);
      message += ` 末日寒冬获得 ${shield} 点护盾。`;
    }
    if (champion.id === "darius" && run.gear.includes("cleaver"))
      damage = Math.round(damage * (1 + f.bleed * 0.03 + (f.bleed >= bleedCap ? 0.1 : 0)));
    if (champion.id === "darius" && id === "r" && f.bleed >= bleedCap && run.augments.includes("dunkMaster"))
      damage = Math.round(damage * 1.35);
    if (champion.id === "tahmkench" && tasteBefore >= 3 && (id === "q" || id === "w") && run.augments.includes("abyssMagic"))
      damage = Math.round(damage * 1.25);
    if (champion.id === "jinx" && (id === "w" || id === "r")) {
      if (run.gear.includes("manamune")) damage += 4 * h.energy;
      if (run.gear.includes("youmuu") && !h.pokeUsed) { damage += 8; h.pokeUsed = true; }
      if (run.augments.includes("artillery") && f.shield >= f.maxHp * 0.1) damage = Math.round(damage * 1.2);
      if (id === "w" && run.gear.includes("serylda") && (intent.dangerous || intent.charge)) f.interrupted = true;
    }
    if (canCrit && h.crit > 0 && damage > 0) {
      h.critMeter += h.crit;
      if (h.critMeter >= 100) {
        h.critMeter -= 100;
        h.lastCritical = true;
        damage = Math.round(damage * (run.gear.includes("infinity") ? 2.25 : 1.75));
        message += " 暴击！";
        if (run.augments.includes("luckyCrit") && !h.critEnergyUsed) { h.energy = Math.min(h.maxEnergy, h.energy + 1); h.critEnergyUsed = true; }
      }
    }
    if (run.augments.includes("conqueror")) { h.conqueror = Math.min(5, h.conqueror + 1); damage = Math.round(damage * (1 + h.conqueror * 0.04)); }
    if (h.armorPen && damage > 0) damage += Math.min(h.armorPen, f.shield);

    if (champion.id !== "cho" && isBasicAttack) {
      if (run.gear.includes("titanic")) damage += Math.round(h.maxHp * 0.04);
      if (run.gear.includes("nashor")) damage += Math.round(2 + h.ap * 0.4);
      if (h.lichReady) {
        damage += Math.round(5 + h.ap);
        h.lichReady = false;
      }
      if (h.icebornReady) {
        damage += Math.round(h.maxHp * 0.07);
        h.icebornReady = false;
      }
      if (id === "attack" && h.trinityReady) {
        const proc = Math.round(6 + h.ad * 0.7);
        damage += proc;
        h.trinityReady = false;
        message += ` 三相咒刃 +${proc}。`;
      }
      if (heartsteelReady) {
        const growth = Math.max(1, Math.round(h.maxHp * 0.02));
        damage += Math.round(h.maxHp * 0.08);
        h.maxHp += growth;
        h.hp += growth;
        h.heartsteelUsed = true;
        message += ` 心之钢永久生命 +${growth}。`;
      }
      h.attacks += 1;
      if (id === "attack") h.basicCards += 1;
      if (run.gear.includes("kraken") && h.attacks % 3 === 0) { const proc = Math.round(14 + h.ad * 0.8); damage += proc; message += ` 海妖 +${proc}。`; }
      if (id === "attack" && run.gear.includes("guinsoo") && h.basicCards % 3 === 0) { const proc = Math.round(8 + h.ad * 0.5); damage += proc; message += ` 鬼索 +${proc}。`; }
      if (h.shieldBash > 0) { damage += h.shieldBash; message += ` 盾击 +${h.shieldBash}。`; h.shieldBash = 0; }
      const machineDraw = champion.id === "jinx" && h.weapon === "机枪" && h.minigun >= 3 && run.augments.includes("overclock");
      if (machineDraw && h.drawsTurn < 2) { h.bonusDraw += 1; h.drawsTurn += 1; }
      if (champion.id === "jinx" && h.weapon === "机枪" && h.minigun >= 3 && run.gear.includes("phantom") && h.attacks % 2 === 0 && h.drawsTurn < 3) { h.bonusDraw += 1; h.drawsTurn += 1; }
      if (run.gear.includes("bork")) damage += Math.max(1, Math.round(f.hp * 0.05));
    }

    if (champion.id === "cho" && id === "attack") {
      damage = h.ad + level * 2;
      if (h.eCharges > 0) {
        damage += Math.round(4 + h.maxHp * 0.03 + level * 2);
        h.eCharges -= 1;
      }
      if (run.gear.includes("titanic")) damage += Math.round(h.maxHp * 0.04);
      if (run.gear.includes("nashor")) damage += Math.round(2 + h.ap * 0.4);
      if (h.lichReady) {
        damage += Math.round(5 + h.ap);
        h.lichReady = false;
      }
      if (h.icebornReady) {
        damage += Math.round(h.maxHp * 0.07);
        h.icebornReady = false;
      }
      if (h.trinityReady) {
        const proc = Math.round(6 + h.ad * 0.7);
        damage += proc;
        h.trinityReady = false;
        message += ` 三相咒刃 +${proc}。`;
      }
      h.basicCards += 1;
      if (run.gear.includes("guinsoo") && h.basicCards % 3 === 0) { const proc = Math.round(8 + h.ad * 0.5); damage += proc; message += ` 鬼索 +${proc}。`; }
      if (heartsteelReady) {
        const growth = Math.max(1, Math.round(h.maxHp * 0.02));
        damage += Math.round(h.maxHp * 0.08);
        h.maxHp += growth;
        h.hp += growth;
        h.heartsteelUsed = true;
        message = `心之钢轰鸣！永久生命 +${growth}。`;
      }
    }
    if (champion.id === "cho" && id === "q") {
      damage = Math.round(9 + level * 4 + h.ap * 0.9);
      const result = attemptStun(f, 2);
      message = result === "stunned"
        ? "破裂命中并眩晕敌人；敌人本回合无法行动！"
        : result === "immune"
          ? "破裂命中，但敌人免疫了本次眩晕。"
          : `破裂命中，韧性压力 ${f.stunProgress}/${maxTenacity}。`;
      if (result === "stunned" && run.gear.includes("iceborn")) h.icebornReady = true;
    }
    if (champion.id === "cho" && id === "w") {
      damage = Math.round(6 + level * 3 + h.ap * 0.65);
      if (intent.dangerous || intent.buff || intent.heal || intent.shield || intent.charge) {
        f.interrupted = true;
        if (run.gear.includes("iceborn")) h.icebornReady = true;
        message = "野性尖叫打断特殊行动；敌人本回合改用普攻。";
      } else message = "野性尖叫命中，但基础攻击无法被打断。";
    }
    if (
      run.gear.includes("shadowflame") &&
      f.hp / f.maxHp < 0.4 &&
      (id === "q" || id === "w")
    )
      damage = Math.round(damage * 1.2);
    if (run.gear.includes("horizon") && (intent.dangerous || intent.charge) && (id === "q" || id === "w"))
      damage = Math.round(damage * 1.25);
    if (champion.id === "cho" && id === "e") {
      h.eCharges = 2 + Math.floor(level / 2);
      message = `恐惧之刺已激活：强化 ${h.eCharges} 次普攻。`;
    }
    if (champion.id === "cho" && id === "r") {
      damage = Math.round(
        (16 + level * 5 + h.maxHp * 0.06 + h.ap * 0.7) *
          (run.augments.includes("giant") ? 1.2 : 1),
      );
      const threshold =
        0.22 + level * 0.04 + (run.augments.includes("execution") ? 0.08 : 0);
      if (f.hp / f.maxHp <= threshold)
        damage = Math.max(damage, f.hp + f.shield);
    }
    if (!interruptedBefore && f.interrupted && run.augments.includes("disruptor") && !h.disruptorUsed) {
      damage += 16;
      h.energy = Math.min(h.maxEnergy, h.energy + 1);
      h.disruptorUsed = true;
      message += " 破法回路造成 8 点伤害并恢复 1 能量。";
    }
    if (!stunnedBefore && f.stunned && run.augments.includes("controlFlow") && !h.controlFlowUsed) {
      h.bonusDraw += 1;
      h.controlFlowUsed = true;
      message += " 冰封连锁抽 1 张牌。";
    }
    if (isSpell) {
      h.spells += 1;
      h.spellsTurn += 1;
      if (run.gear.includes("shojin")) {
        h.shojinCasts += 1;
        h.bonusDraw += 1;
        message += " 朔极之矛抽 1 张牌。";
      }
      if (run.gear.includes("manamune") && h.spells === 3) h.bonusDraw += 1;
      if (id === "r" && run.gear.includes("axiom")) {
        h.energy = Math.min(h.maxEnergy, h.energy + 1);
        message += " 公理圆弧恢复 1 能量。";
        if (champion.id === "jinx" && !h.axiomUsed) {
          h.axiomUsed = true;
          h.returnUltimate = true;
        }
      }
      if (run.gear.includes("lichbane") && !h.lichUsed) {
        h.lichReady = true;
        h.lichUsed = true;
      }
      if (run.gear.includes("trinity") && !h.trinityUsed) {
        h.trinityReady = true;
        h.trinityUsed = true;
      }
      if (run.gear.includes("cosmic") && h.spellsTurn === 2 && !h.cosmicUsed) {
        h.bonusDraw += 1;
        h.cosmicUsed = true;
        message += " 宇宙驱动抽 1 张牌。";
      }
      if (id === "r" && run.gear.includes("hexplate")) {
        h.energy = Math.min(h.maxEnergy, h.energy + 1);
        message += " 海克斯板甲恢复 1 能量。";
        if (!h.hexplateUsed) {
          h.bonusDraw += 1;
          h.hexplateUsed = true;
          message += " 本场首次触发并抽 1 张牌。";
        }
      }
      if (id === "e" && run.gear.includes("frozenheart") && !h.frozenheartUsed) {
        const shield = Math.round(h.maxHp * 0.08);
        h.energy = Math.min(h.maxEnergy, h.energy + 1);
        h.shield += shield;
        h.frozenheartUsed = true;
        message += ` 冰霜之心恢复 1 能量并获得 ${shield} 点护盾。`;
      }
      if (run.gear.includes("luden") && h.spells % 3 === 0) {
        damage += Math.round(10 + h.ap * 0.6);
        message += " 卢登回响触发！";
      }
      if (run.gear.includes("liandry") && (id === "q" || id === "w"))
        h.burn = Math.round(6 + h.ap * 0.35);
      if (
        run.gear.includes("riftmaker") &&
        h.turn >= (run.gear.includes("jaksho") ? 3 : 4)
      )
        damage = Math.round(damage * 1.15);
      if (
        run.augments.includes("echo") &&
        h.spells === 1 &&
        (id === "q" || id === "w")
      )
        damage += 7;
    }
    if (damage > 0 && run.augments.includes("firstStrike") && !h.firstStrikeUsed) {
      damage = Math.round(damage * 1.2);
      h.firstStrikeUsed = true;
      message += " 先发锋芒使伤害提高 20%。";
    }
    if (damage > 0 && run.augments.includes("lastStand") && h.energy === 0) {
      damage = Math.round(damage * 1.25);
      message += " 孤注一掷使伤害提高 25%。";
    }
    if (isBasicAttack && h.lastCritical && run.gear.includes("essence") && !h.essenceUsed) {
      h.energy = Math.min(h.maxEnergy, h.energy + 1); h.bonusDraw += 1; h.essenceUsed = true; message += " 夺萃回能并抽牌。";
    }
    damage = Math.max(0, Math.round(damage * HERO_DAMAGE_SCALE));
    if (id === "r" && champion.id === "cho") {
      const executeLine = 0.22 + level * 0.04 + (run.augments.includes("execution") ? 0.08 : 0);
      if (f.hp / f.maxHp <= executeLine) damage = Math.max(damage, f.hp + f.shield);
    }
    if (id === "r" && champion.id === "tahmkench") {
      const executeLine = base.boss || base.finalBoss
        ? Math.min(0.16, 0.08 + level * 0.02)
        : Math.min(0.28, 0.18 + level * 0.03);
      if (f.hp / f.maxHp <= executeLine) damage = Math.max(damage, f.hp + f.shield);
    }
    const criticalDamage = h.lastCritical ? damage : 0;
    h.lastCritical = false;
    if (damage > 0) {
      const result = damageFoe(f, damage);
      f = result;
      message += ` 造成 ${result.dealt} 点伤害。`;
      if (criticalDamage > 0) {
        setDamagePopup({ value: result.dealt });
        setTimeout(() => setDamagePopup(null), 850);
      }
      if (isBasicAttack && (run.gear.includes("bork") || run.gear.includes("bloodthirster"))) {
        const ratio = run.gear.includes("bloodthirster") ? 0.25 : 0.15;
        const healing = Math.max(1, Math.round(result.dealt * ratio));
        const missing = h.maxHp - h.hp;
        const healed = Math.min(missing, healing);
        h.hp += healed;
        const overflow = healing - healed;
        if (overflow > 0 && run.gear.includes("bloodthirster")) h.shield = Math.min(Math.round(h.maxHp * 0.2), h.shield + overflow);
        message += ` 吸血恢复 ${healed}${overflow > 0 ? `，溢出护盾 +${overflow}` : ""}。`;
      }
    }
    if (id === "r" && f.hp === 0 && run.augments.includes("feastHeal"))
      h.hp = Math.min(h.maxHp, h.hp + Math.round(h.maxHp * 0.18));
    if (id === "r" && f.hp === 0 && run.gear.includes("deathdance")) { h.hp = Math.min(h.maxHp, h.hp + Math.round(h.maxHp * 0.16)); f.bonus = 0; }
    if (id === "r" && f.hp === 0 && run.augments.includes("dunkMaster")) h.bonusDraw += 1;
    if (run.gear.includes("collector") && f.hp > 0 && f.hp / f.maxHp <= 0.08) { f.hp = 0; message += " 收集者处决！"; }
    if (
      id === "r" &&
      f.hp === 0 &&
      (champion.id === "tahmkench" ||
        (champion.id === "cho" && (base.boss || base.finalBoss)))
    ) {
      const growth = champion.id === "tahmkench" ? 6 : 8;
      const totalGrowth = champion.id === "tahmkench" && run.augments.includes("thickSkin") ? growth + Math.max(1, Math.round(h.maxHp * 0.04)) : growth;
      h.maxHp += totalGrowth;
      h.hp += totalGrowth;
      h.feast += 1;
      message += ` ${champion.id === "tahmkench" ? "吞噬" : "盛宴"}斩杀，永久生命 +${totalGrowth}！`;
    }
    if (
      id === "r" &&
      f.hp === 0 &&
      champion.id === "cho" &&
      !base.boss &&
      !base.finalBoss
    ) {
      message += " 盛宴斩杀了非英雄单位，本次不获得永久生命。";
    }
    const returnsDariusUltimate = champion.id === "darius" && id === "r" && f.bleed >= bleedCap;
    let nextHand = hand.filter((_, i) => i !== index);
    let nextDiscard = returnsDariusUltimate ? [...discard] : [...discard, id];
    if (returnsDariusUltimate) {
      nextHand.push("r");
      message += " 满层流血使诺克萨斯断头台立即返回手牌。";
    }
    if (h.destinyDraw) {
      const extra = draw(pile, nextDiscard, Math.min(h.destinyDraw, 8 - nextHand.length));
      nextHand = [...nextHand, ...extra.cards];
      nextDiscard = extra.discard;
      setPile(extra.pile);
      h.destinyDraw = 0;
    }
    if (h.bonusDraw) {
      const extra = draw(pile, nextDiscard, Math.min(h.bonusDraw, 8 - nextHand.length));
      nextHand = [...nextHand, ...extra.cards]; nextDiscard = extra.discard; setPile(extra.pile); h.bonusDraw = 0;
    }
    if (h.returnUltimate && !nextHand.includes("r") && nextHand.length < 8) { nextHand.push("r"); h.returnUltimate = false; }
    setHero(h);
    setFoe(f);
    setHand(nextHand);
    setDiscard(nextDiscard);
    setLog([message]);
    if (f.hp <= 0) {
      setLocked(true);
      const persistentMax = h.maxHp;
      setTimeout(
        () =>
          onWin(
            {
              hp: Math.min(persistentMax, h.hp),
              maxHp: persistentMax,
              ad: run.hero.ad,
              ap: run.hero.ap,
              feast: h.feast,
              crit: run.hero.crit || 0,
              armorPen: h.armorPen,
              critMeter: h.critMeter,
              energyBonus: h.energyBonus || 0,
              openingDraw: h.openingDraw || 0,
            },
            base,
          ),
        350,
      );
    }
  };

  const endTurn = () => {
    if (locked) return;
    let h = { ...hero },
      f = { ...foe },
      message;
    let guardMessage = "";
    if (run.augments.includes("patientGuard") && hand.length >= 4) {
      const shield = Math.round(h.maxHp * 0.1);
      h.shield += shield;
      guardMessage = `寒冬守势获得 ${shield} 点护盾。`;
    }
    const specialStopped = f.interrupted ||
      (f.silenced && (intent.buff || intent.heal || intent.shield || intent.charge));
    if (f.stunned) {
      message = `${base.name}被眩晕，本回合无法行动。`;
    } else if (specialStopped) {
      const basicAction = base.actions.find((action) => action.damage && !action.dangerous) || base.actions.find((action) => action.damage);
      let incoming = Math.max(0, (basicAction?.damage || 6) + f.bonus);
      const bansheeTriggered = h.bansheeReady && incoming > 0;
      if (bansheeTriggered) { incoming = 0; h.bansheeReady = false; }
      const blocked = Math.min(h.shield, incoming), taken = incoming - blocked;
      h.shield -= blocked; h.hp = Math.max(0, h.hp - taken); f.bonus = 0;
      if (champion.id === "tahmkench") h.grayDamage += taken;
      message = bansheeTriggered
        ? `${base.name}的「${intent.name}」被打断，改用普攻；女妖面纱抵消伤害。`
        : `${base.name}的「${intent.name}」被打断，改用普攻造成 ${taken} 点伤害。`;
      if (blocked > 0 && run.gear.includes("despair")) { const pulse = Math.round(blocked * 0.5); f = damageFoe(f, pulse); h.hp = Math.min(h.maxHp, h.hp + pulse); message += ` 无终恨意反击并恢复 ${pulse} 点。`; }
      if (taken > 0 && (run.augments.includes("thornBody") || run.gear.includes("thornmail"))) { const reflect = run.gear.includes("thornmail") ? (run.augments.includes("thornBody") ? 12 : 7) : 5; f = damageFoe(f, reflect); message += ` 反击 ${reflect} 点。`; }
      if (h.hp > 0 && h.hp / h.maxHp < 0.4 && run.gear.includes("sterak") && !h.sterakUsed) { const shield = Math.round(h.maxHp * 0.25); h.shield += shield; h.sterakUsed = true; message += ` 斯特拉克获得 ${shield} 点护盾。`; }
    }
    else if (intent.charge) {
      f.bonus +=
        intent.charge -
        (base.actions[(f.turn + 1) % base.actions.length].damage || 0);
      message = `${base.name}完成蓄力，下一击极其危险！`;
    } else if (intent.buff) {
      f.bonus += intent.buff;
      message = `${base.name}强化了后续攻击。`;
    } else if (intent.shield) {
      f.shield += intent.shield;
      message = `${base.name}获得 ${intent.shield} 点护盾。`;
    } else if (intent.heal) {
      f.hp = Math.min(f.maxHp, f.hp + intent.heal);
      message = `${base.name}恢复 ${intent.heal} 点生命。`;
    } else {
      let incoming = Math.max(
        0,
        intent.damage + f.bonus - (f.silenced ? 5 : 0),
      );
      const bansheeTriggered = h.bansheeReady && incoming > 0;
      if (bansheeTriggered) {
        incoming = 0;
        h.bansheeReady = false;
        if (run.gear.includes("lichbane")) h.lichReady = true;
      }
      const blocked = Math.min(h.shield, incoming),
        taken = incoming - blocked;
      h.shield -= blocked;
      h.hp = Math.max(0, h.hp - taken);
      f.bonus = 0;
      if (champion.id === "tahmkench") h.grayDamage += taken;
      if (intent.drain) h.drained = intent.drain;
      message = bansheeTriggered
        ? `女妖面纱抵消了「${intent.name}」的全部伤害。`
        : `${base.name}发动「${intent.name}」，造成 ${taken} 点伤害。`;
      if (intent.blind && !bansheeTriggered) {
        h.blind = Math.max(h.blind, intent.blind);
        message += ` 致盲：接下来 ${intent.blind} 次普攻各有50%几率落空。`;
      }
      if (blocked > 0 && run.gear.includes("despair")) { const pulse = Math.round(blocked * 0.5); f = damageFoe(f, pulse); h.hp = Math.min(h.maxHp, h.hp + pulse); message += ` 无终恨意反击并恢复 ${pulse} 点。`; }
      if (h.hp > 0 && h.hp / h.maxHp < 0.4 && run.gear.includes("sterak") && !h.sterakUsed) { const shield = Math.round(h.maxHp * 0.25); h.shield += shield; h.sterakUsed = true; message += ` 斯特拉克获得 ${shield} 点护盾。`; }
      if (
        taken > 0 &&
        (run.augments.includes("thornBody") || run.gear.includes("thornmail"))
      ) {
        const reflect = run.gear.includes("thornmail")
          ? run.augments.includes("thornBody")
            ? 12
            : 7
          : 5;
        f = damageFoe(f, reflect);
        message += ` 反击 ${reflect} 点。`;
      }
    }
    if (guardMessage) message = `${guardMessage} ${message}`;
    if (run.gear.includes("sunfire") && f.hp > 0) {
      const burn = Math.round(h.maxHp * 0.04);
      f = damageFoe(f, burn);
      message += ` 日炎造成 ${burn} 点伤害。`;
    }
    if (h.burn > 0 && f.hp > 0) {
      f = damageFoe(f, h.burn);
      message += ` 兰德里灼烧 ${h.burn} 点。`;
      h.burn = 0;
    }
    if (champion.id === "darius" && f.bleed > 0 && f.hp > 0) {
      const bleedDamage = Math.round(f.bleed * (run.augments.includes("bloodEmpire") ? 3 : 2) * HERO_DAMAGE_SCALE);
      f = damageFoe(f, bleedDamage);
      message += ` 流血造成 ${bleedDamage} 点。`;
    }
    if (f.bleed > 0) {
      f.bleed -= 1;
      message += ` 流血衰减至 ${f.bleed} 层。`;
    }
    if (f.taste > 0) {
      f.taste -= 1;
      message += ` 品味衰减至 ${f.taste} 层。`;
    }
    if (run.augments.includes("secondWind") && h.hp > 0) {
      const healed = Math.min(4, h.maxHp - h.hp);
      h.hp += healed;
      if (healed) message += ` 复苏之风恢复 ${healed} 点。`;
    }
    if (run.gear.includes("jaksho") && h.turn >= 3 && !h.jakshoUsed) {
      const shield = Math.round(h.maxHp * 0.15);
      h.shield += shield;
      h.jakshoUsed = true;
      message += ` 贾修提供 ${shield} 点护盾。`;
    }
    const drawCount = Math.max(0, Math.min(4, 8 - hand.length));
    const result = draw(pile, discard, drawCount);
    const retainedHand = [...hand, ...result.cards];
    h.energy = Math.max(1, h.maxEnergy - h.drained);
    h.drained = 0;
    h.turn += 1;
    h.lichReady = false;
    h.lichUsed = false;
    h.trinityReady = false;
    h.trinityUsed = false;
    h.spellsTurn = 0;
    h.cosmicUsed = false;
    h.frozenheartUsed = false;
    h.firstStrikeUsed = false;
    h.disruptorUsed = false;
    h.controlFlowUsed = false;
    h.drawsTurn = 0;
    h.pokeUsed = false;
    h.critEnergyUsed = false;
    h.essenceUsed = false;
    h.conqueror = 0;
    f.turn += 1;
    f.interrupted = false;
    f.silenced = false;
    f.stunned = false;
    f.stunProgress = 0;
    setHero(h);
    setFoe(f);
    setHand(retainedHand);
    setPile(result.pile);
    setDiscard(result.discard);
    setLog([message, `保留未使用手牌，补抽 ${result.cards.length} 张。`]);
    if (f.hp <= 0) {
      setLocked(true);
      setTimeout(
        () =>
          onWin(
            {
              hp: h.hp,
              maxHp: h.maxHp,
              ad: run.hero.ad,
              ap: run.hero.ap,
              feast: h.feast,
              crit: run.hero.crit || 0,
              armorPen: h.armorPen,
              critMeter: h.critMeter,
              energyBonus: h.energyBonus || 0,
              openingDraw: h.openingDraw || 0,
            },
            base,
          ),
        350,
      );
    } else if (h.hp <= 0) {
      setLocked(true);
      setTimeout(onLose, 350);
    }
  };

  const interrupted = foe.interrupted ||
    (foe.silenced && (intent.buff || intent.heal || intent.shield || intent.charge));
  const controlled = foe.stunned || interrupted;
  return (
    <main className="battle-shell">
      <Header
        run={{ ...run, hero }}
        onQuit={onQuit}
        label={base.boss || base.finalBoss ? "首领试炼" : base.elite ? "精英试炼" : "冰原战斗"}
      />
      <EquipmentBar gear={run.gear} detailed />
      <section className="battlefield">
        <div className="combatant hero-combatant">
          <div className="unit-portrait cho" style={{ "--champion-color": champion.color }}>
            <img src={champion.image} alt={champion.name} />
          </div>
          <h2>{champion.name}</h2>
          <small>回合 {hero.turn}</small>
          <Health value={hero.hp} max={hero.maxHp} />
          <div className="combat-stats">
            <span>
              <small>生命</small>
              <b>
                {hero.hp}/{hero.maxHp}
              </b>
            </span>
            <span>
              <small>AD</small>
              <b>{hero.ad}</b>
            </span>
            <span>
              <small>AP</small>
              <b>{hero.ap}</b>
            </span>
            <span>
              <small>能量</small>
              <b>
                {hero.energy}/{hero.maxEnergy}
              </b>
            </span>
          </div>
          <div className="unit-stats">
            <span>⬡ 护盾 {hero.shield}</span>
            {hero.blind > 0 && <span className="enemy-debuff">☄ 致盲 {hero.blind}次 · 普攻50%落空</span>}
            {champion.id === "twistedfate" && <span>▣ {hero.empowered ? `下一张A：${hero.selectedCard}` : "W：蓝 / 红 / 金三选一"}</span>}
            {champion.id === "jinx" && <span>⇄ {hero.weapon} · 连击 {hero.minigun}</span>}
            {hero.crit > 0 && <span>✹ 暴击 {hero.crit}% · 蓄积 {hero.critMeter}/100</span>}
            {hero.armorPen > 0 && <span>➶ 穿甲 {hero.armorPen}</span>}
            {heartsteelReady && (
              <span className="ready-status">♥ 心之钢就绪</span>
            )}
            {hero.lichReady && (
              <span className="ready-status">⚡ 巫妖就绪</span>
            )}
          </div>
        </div>
        <div className="battle-center">
          <div className="turn-log">
            {log.map((line, i) => (
              <span key={i}>{line}</span>
            ))}
          </div>
          <div
            className={`intent-card enemy-intent desktop-enemy-intent ${controlled ? "controlled-intent" : intent.dangerous ? "dangerous" : ""}`}
          >
            <small>{foe.stunned ? "眩晕" : interrupted ? "特殊行动已打断" : intent.dangerous ? "危险意图" : "敌人意图"}</small>
            <strong>{foe.stunned ? "✕" : interrupted ? "⚔" : intent.icon}</strong>
            <b>{foe.stunned ? "无法行动" : interrupted ? "改用普攻" : intent.name}</b>
            <span>{foe.stunned ? `本回合无法行动。下回合：${nextIntent.name}（${nextIntent.text}）` : interrupted ? `「${intent.name}」已取消，本回合改用基础攻击。` : intent.text}</span>
          </div>
        </div>
        <div className="combatant enemy-combatant">
          <div className={`unit-portrait enemy-art ${base.theme}`}>
            <img
              key={`${enemyId}-${chapter}`}
              src={`.${base.image}`}
              alt={base.name}
              loading="eager"
              onError={(event) => {
                if (event.currentTarget.dataset.fallback) return;
                event.currentTarget.dataset.fallback = "true";
                event.currentTarget.src = base.image;
              }}
            />
            {damagePopup && (
              <span className="critical-popup">暴击 -{damagePopup.value}</span>
            )}
          </div>
          <h2>{base.name}</h2>
          <small>{base.subtitle}</small>
          <Health value={foe.hp} max={foe.maxHp} enemy />
          <div className="unit-stats">
            <span>⬡ 护盾 {foe.shield}</span>
            {champion.id === "darius" && <span className="enemy-debuff">✦ 流血 {foe.bleed}/{run.augments.includes("bloodEmpire") ? 7 : 5} · 回合结束造成 {Math.round(foe.bleed * (run.augments.includes("bloodEmpire") ? 3 : 2) * HERO_DAMAGE_SCALE)} 伤害</span>}
            {champion.id === "tahmkench" && <span className={`enemy-debuff ${foe.taste >= 3 ? "trigger-ready" : ""}`}>◆ 品味 {foe.taste}/3 · {foe.taste >= 3 ? "Q可眩晕 / R增伤" : "普攻继续叠加"}</span>}
            {foe.stunned && <span>眩晕：无法行动</span>}
            {interrupted && <span>打断：改用普攻</span>}
            {foe.stunProgress > 0 && <span>韧性压力 {foe.stunProgress}/{maxTenacity}</span>}
            {foe.controlWard && <span>下次眩晕免疫</span>}
          </div>
          <div
            className={`intent-card enemy-intent mobile-enemy-intent ${controlled ? "controlled-intent" : intent.dangerous ? "dangerous" : ""}`}
          >
            <small>{foe.stunned ? "眩晕" : interrupted ? "特殊行动已打断" : intent.dangerous ? "危险意图" : "敌人意图"}</small>
            <strong>{foe.stunned ? "✕" : interrupted ? "⚔" : intent.icon}</strong>
            <b>{foe.stunned ? "无法行动" : interrupted ? "改用普攻" : intent.name}</b>
            <span>{foe.stunned ? `本回合无法行动。下回合：${nextIntent.name}` : interrupted ? `「${intent.name}」已取消，改用基础攻击。` : intent.text}</span>
          </div>
        </div>
      </section>
      <section className="hand-zone">
        <div className="deck-counter">
          <span>抽牌堆</span>
          <b>{pile.length}</b>
          <small>手牌 {hand.length}/8</small>
        </div>
        <div className="cards-row">
          {hand.map((id, i) => (
            <SkillCard
              key={`${id}-${i}`}
              skill={skillSet[id]}
              text={skillPreview(id)}
              level={run.upgrades[id]}
              cost={id === "q" && run.augments.includes("quickRupture") ? Math.max(0, skillSet[id].cost - 1) : skillSet[id].cost}
              disabled={hero.energy < (id === "q" && run.augments.includes("quickRupture") ? Math.max(0, skillSet[id].cost - 1) : skillSet[id].cost)}
              onClick={() => {
                if (champion.id === "twistedfate" && id === "w") setCardChoice({ index: i });
                else play(id, i);
              }}
            />
          ))}
        </div>
        <span className="swipe-card-hint">点击卡牌打出</span>
        <div className="turn-controls">
          <div className="energy-orb">
            <b>{hero.energy}</b>
            <span>
              / {hero.maxEnergy}
              <small>能量</small>
            </span>
          </div>
          <button className="end-turn" onClick={endTurn}>
            结束回合 <span>→</span>
          </button>
        </div>
      </section>
      {cardChoice && (
        <div className="card-choice-overlay" role="dialog" aria-modal="true" aria-label="选择卡牌大师的牌">
          <div className="card-choice-panel">
            <small>W · 选牌</small>
            <h2>选择下一张飞牌</h2>
            <div className="pick-a-card-grid">
              <button className="pick-blue" onClick={() => { play("w", cardChoice.index, "蓝牌"); setCardChoice(null); }}>
                <b>蓝牌</b><span>下一张A命中后恢复 2 能量</span>
              </button>
              <button className="pick-red" onClick={() => { play("w", cardChoice.index, "红牌"); setCardChoice(null); }}>
                <b>红牌</b><span>下一张A额外造成 {Math.round((7 + hero.ap * 0.55) * HERO_DAMAGE_SCALE)} 点伤害</span>
              </button>
              <button className="pick-gold" onClick={() => { play("w", cardChoice.index, "金牌"); setCardChoice(null); }}>
                <b>金牌</b><span>下一张A施加眩晕；精英/BOSS需 2 次</span>
              </button>
            </div>
            <button className="cancel-card-choice" onClick={() => setCardChoice(null)}>取消</button>
          </div>
        </div>
      )}
    </main>
  );
}

function Health({ value, max, enemy }) {
  return (
    <div className={`health-bar ${enemy ? "enemy-health" : ""}`}>
      <i style={{ width: `${Math.max(0, (value / max) * 100)}%` }} />
      <b>
        {value} / {max}
      </b>
    </div>
  );
}
function SkillCard({
  skill,
  text,
  level,
  disabled,
  onClick,
  cost = skill.cost,
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`game-card type-${skill.type} ${disabled ? "disabled" : ""}`}
    >
      <span className="card-cost">{cost}</span>
      <span className="skill-key">{skill.key}</span>
      <span className="card-icon">{skill.icon}</span>
      <b>{skill.name}</b>
      <small>
        {skill.typeName} · 强化 {level}
      </small>
      <p>{text}</p>
    </button>
  );
}

function GearShop({ run, stock, purchased, onBuy, onContinue, onQuit }) {
  const full = run.gear.length >= 5;
  const noAffordable = stock.every((id) => equipment[id].price > run.gold);
  useEffect(() => {
    if (!purchased) return undefined;
    const timer = setTimeout(onContinue, 700);
    return () => clearTimeout(timer);
  }, [purchased, onContinue]);
  return (
    <main className="shop-shell gear-shop-screen">
      <Header run={run} onQuit={onQuit} label="战后装备选择" />
      <section className="node-heading">
        <div className="node-symbol">♜</div>
        <div>
          <div className="eyebrow">COMPLETE ITEMS · ◈ {run.gold}</div>
          <h1>{purchased ? "装备已加入构筑" : "购买一件完整装备"}</h1>
          <p>
            {purchased
              ? "正在自动进入下一阶段。"
              : noAffordable
                ? "金币不足，你可以查看装备后自行选择跳过，并保留金币。"
                : full
                  ? "装备栏已满，请自行继续前往下一阶段。"
                  : "三件装备分别提供核心联动、体系补强与转型机会。"}
          </p>
        </div>
      </section>
      <EquipmentBar gear={run.gear} />
      <section className="gear-stock">
        {stock.map((id) => {
          const item = equipment[id];
          const stats = equipmentStats(item);
          const matchingBuilds = championBuilds[run.championId].filter((build) => build.items.includes(id));
          const tooExpensive = run.gold < item.price;
          const disabled = purchased || tooExpensive || full;
          return (
            <button
              key={id}
              disabled={disabled}
              className={`gear-card ${disabled ? "disabled" : ""}`}
              onClick={() => onBuy(item)}
            >
              <span className="gear-icon">
                <img src={item.image} alt="" />
              </span>
              <div className="gear-tags">
                {item.tags.map((t) => (
                  <small key={t}>{t}</small>
                ))}
              </div>
              <div className="gear-stats">{stats.map((stat) => <small key={stat}>{stat}</small>)}</div>
              {matchingBuilds.length > 0 && <small className="route-fit">适配：{matchingBuilds.map((build) => build.name).join(" · ")}</small>}
              <h3>{item.name}</h3>
              <p>{item.text}</p>
              <b>◈ {item.price}</b>
              {tooExpensive && !purchased && (
                <em>还差 {item.price - run.gold} 金币</em>
              )}
            </button>
          );
        })}
      </section>
      <div className="node-actions">
        <span>
          {purchased
            ? "购买成功，正在继续…"
            : full
              ? "五个装备栏已全部装满"
              : `当前金币 ◈ ${run.gold}`}
        </span>
        {!purchased && (
          <button className="skip-gear" onClick={onContinue}>
            {full ? "继续前进 →" : "跳过购买，保留金币 →"}
          </button>
        )}
      </div>
    </main>
  );
}

function SkillReward({ run, onChoose, onQuit }) {
  const skillSet = championRoster[run.championId || "cho"].skills;
  const options = useMemo(
    () =>
      ["q", "w", "e", "r"]
        .sort((a, b) => run.upgrades[a] - run.upgrades[b])
        .slice(0, 3),
    [run.upgrades],
  );
  return (
    <main className="reward-screen skill-reward-screen">
      <Header run={run} onQuit={onQuit} label="技能强化" />
      <div className="reward-heading">
        <div className="eyebrow">MASTER YOUR ABILITIES</div>
        <h1>强化一种英雄技能</h1>
        <p>牌组不会加入新招式；你只会越来越精通已有技能。</p>
      </div>
      <div className="skill-reward-grid">
        {options.map((id) => (
          <button key={id} onClick={() => onChoose(id)}>
            <span>{skillSet[id].key}</span>
            <b>{skillSet[id].name}</b>
            <p>{skillSet[id].text}</p>
            <small>
              强化 {run.upgrades[id]} → {run.upgrades[id] + 1}
            </small>
          </button>
        ))}
      </div>
    </main>
  );
}

function Rest({ run, onChoose, onQuit }) {
  const physical = run.championId === "darius" || run.championId === "jinx";
  const chapter = route[run.node]?.chapter || 1;
  const pools = [
    { id: physical ? "ad" : "ap", icon: "◇", name: physical ? "磨砺武器" : "聆听魔力", text: `永久获得 ${physical ? [3, 4, 5][chapter - 1] : [7, 9, 12][chapter - 1]} 点 ${physical ? "AD" : "AP"}` },
    { id: "vitality", icon: "♥", name: "抗寒训练", text: `永久获得 ${[10, 14, 18][chapter - 1]} 点最大生命` },
    { id: "energy", icon: "◈", name: "灵活调度", text: "每场战斗的最大能量与初始能量 +1" },
    { id: "draw", icon: "▣", name: "整备牌组", text: "每场战斗的初始手牌 +1" },
    { id: "crit", icon: "✹", name: "寻找破绽", text: `永久获得 ${[8, 10, 12][chapter - 1]}% 暴击率` },
    { id: "penetration", icon: "➶", name: "破冰锋刃", text: `永久获得 ${[2, 3, 4][chapter - 1]} 点穿甲` },
  ];
  const choices = [...pools]
    .sort(
      (a, b) =>
        seededRewardScore(`${a.id}:camp:${run.node}`, run.rewardSeed) -
        seededRewardScore(`${b.id}:camp:${run.node}`, run.rewardSeed),
    )
    .slice(0, 3);
  return (
    <main className="shop-shell rest-screen">
      <Header run={run} onQuit={onQuit} label="炉火营地" />
      <section className="node-heading">
        <div className="node-symbol warm">♨</div>
        <div>
          <div className="eyebrow">SAFE CAMP</div>
          <h1>暴风雪中的炉火</h1>
          <p>从三项随机机动强化中选择一项，永久改善后续战斗。</p>
        </div>
      </section>
      <section className="rest-options">
        {choices.map((choice) => (
          <button key={choice.id} onClick={() => onChoose(choice.id)}>
            <strong>{choice.icon}</strong>
            <b>{choice.name}</b>
            <p>{choice.text}</p>
          </button>
        ))}
      </section>
    </main>
  );
}

function Augment({ run, onChoose, onQuit }) {
  const available = augments.filter((a) => !run.augments.includes(a.id) && (!a.champions || a.champions.includes(run.championId)));
  const personal = available.filter((a) => a.champions?.includes(run.championId));
  const universal = available.filter((a) => !a.champions);
  const choices = [...personal, ...universal]
    .sort(
      (a, b) =>
        seededRewardScore(`${a.id}:augment:${run.node}`, run.rewardSeed) -
        seededRewardScore(`${b.id}:augment:${run.node}`, run.rewardSeed),
    )
    .slice(0, 3);
  return (
    <main className="reward-screen augment-screen">
      <Header run={run} onQuit={onQuit} label="海克斯赐福" />
      <div className="reward-heading">
        <div className="eyebrow">HEXTECH AUGMENT</div>
        <h1>选择一枚海克斯</h1>
        <p>三章旅程最多获得四枚，选择后自动继续。</p>
      </div>
      <div className="augment-grid">
        {choices.map((a) => (
          <button
            key={a.id}
            onClick={() => onChoose(a)}
            className={`augment-card rarity-${a.rarity}`}
          >
            <span className="augment-rarity">{a.rarity}</span>
            <span className="augment-icon">{a.icon}</span>
            <b>{a.name}</b>
            <p>{a.text}</p>
            <small>选择强化</small>
          </button>
        ))}
      </div>
    </main>
  );
}

function Result({ win, onBack }) {
  return (
    <main className="result-screen">
      <div>
        <span className="result-rune">{win ? "❄" : "☠"}</span>
        <h1>{win ? "大魔王挑战完成" : "旅程止步于此"}</h1>
        <p>
          {win
            ? "你穿越冰霜王座并击败了提莫大魔王，真正完成了弗雷尔卓德登顶挑战。"
            : "危险行动必须认真应对。调整装备路线，再来一次。"}
        </p>
        <button className="start-button" onClick={onBack}>
          返回旅程大厅
        </button>
      </div>
    </main>
  );
}

function GameRun({ championId, onQuit }) {
  const [run, setRun] = useState(() => defaultRun(championId));
  const [screen, setScreen] = useState("map");
  const [enemyId, setEnemyId] = useState("wolf");
  const [postBattle, setPostBattle] = useState(null);
  const [bought, setBought] = useState(false);
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [screen]);
  const stock = useMemo(() => {
    const builds = championBuilds[run.championId];
    const relevantIds = [...new Set(builds.flatMap((build) => build.items))];
    const allCandidates = relevantIds.filter((id) => !run.gear.includes(id));
    const previous = run.lastShopStock || [];
    const candidates = allCandidates.filter((id) => !previous.includes(id));
    const pool = candidates.length >= 3 ? candidates : allCandidates;
    const buildScore = (build) => run.gear.reduce((score, id) => score + (build.items.includes(id) ? 3 : -1), 0);
    const rankedBuilds = [...builds].sort((a, b) => buildScore(b) - buildScore(a));
    const committed = run.gear.length >= 2 ? rankedBuilds[0] : builds[run.node % builds.length];
    const seed = run.rewardSeed + run.node * 97 + run.shopRoll * 193 + run.gold * 17 + run.championId.length * 31;
    const hash = (id, salt) => [...id].reduce((value, char) => (value * 33 + char.charCodeAt(0)) % 100003, seed + salt);
    const shuffled = (ids, salt) => [...ids].sort((a, b) => hash(a, salt) - hash(b, salt));
    const corePool = committed.items.filter((id) => pool.includes(id));
    const synergyPool = pool.filter((id) => rankedBuilds.some((build) => build.items.includes(id) && build.items.some((owned) => run.gear.includes(owned))));
    const pivotPool = pool.filter((id) => !committed.items.includes(id));
    const choices = [];
    const take = (ids, salt) => {
      const id = shuffled(ids.filter((candidate) => !choices.includes(candidate)), salt)[0];
      if (id) choices.push(id);
    };
    take(corePool, 11);
    take(synergyPool, 23);
    take(pivotPool, 37);
    shuffled(pool, 53).forEach((id) => { if (choices.length < 3 && !choices.includes(id)) choices.push(id); });
    return choices.slice(0, 3);
  }, [run.gear, run.node, run.championId, run.gold, run.shopRoll, run.lastShopStock, run.rewardSeed]);

  const chooseNode = useCallback((node) => {
    if (node.type === "battle") {
      setEnemyId(node.enemy);
      setScreen("battle");
    } else setScreen("rest");
  }, []);
  const winBattle = (hero, enemy) => {
    const node = route[run.node];
    if (node.summitBoss) {
      setRun((r) => ({
        ...r,
        hero: { ...hero, hp: hero.maxHp },
        gold: r.gold + enemy.gold,
        node: r.node + 1,
      }));
      setScreen("map");
      return;
    }
    if (node.finalBoss) {
      setRun((r) => ({ ...r, hero: { ...hero, hp: hero.maxHp }, gold: r.gold + enemy.gold }));
      setScreen("victory");
      return;
    }
    setRun((r) => {
      const amp = r.gear.includes("visage") ? 1.5 : 1;
      const recoveryRatio = r.gear.includes("warmog") ? 0.18 : 0;
      const recoveredHero = { ...hero, hp: Math.min(hero.maxHp, hero.hp + Math.round(hero.maxHp * recoveryRatio * amp)) };
      return { ...r, hero: recoveredHero, gold: r.gold + enemy.gold };
    });
    setPostBattle({ augment: !!node.augment, finalBoss: !!enemy.finalBoss });
    setBought(false);
    setScreen("gear");
  };
  const buyGear = (item) => {
    setRun((r) => ({
      ...r,
      gold: r.gold - item.price,
      gear: [...r.gear, item.id],
      shopRoll: r.shopRoll + 1,
      lastShopStock: stock,
      hero: {
        ...r.hero,
        maxHp: r.hero.maxHp + (item.hp || 0),
        hp: r.hero.hp + (item.hp || 0),
        ap: r.hero.ap + (item.ap || 0),
        ad: r.hero.ad + (item.ad || 0),
        crit: (r.hero.crit || 0) + (item.crit || 0),
        armorPen: (r.hero.armorPen || 0) + (item.armorPen || 0),
      },
    }));
    setBought(true);
  };
  const afterGear = () => {
    if (!bought) {
      setRun((r) => ({ ...r, shopRoll: r.shopRoll + 1, lastShopStock: stock }));
    }
    if (postBattle.finalBoss) setScreen("victory");
    else if (postBattle.augment) setScreen("augment");
    else setScreen("skill");
  };
  const upgradeSkill = (id) => {
    setRun((r) => ({
      ...r,
      upgrades: { ...r.upgrades, [id]: r.upgrades[id] + 1 },
      node: r.node + 1,
    }));
    setScreen("map");
  };
  const chooseAugment = (item) => {
    setRun((r) => {
      const next = {
        ...r,
        augments: [...r.augments, item.id],
        node: r.node + 1,
      };
      if (item.id === "giant") {
        const gain = Math.round(r.hero.maxHp * 0.2);
        next.hero = {
          ...r.hero,
          maxHp: r.hero.maxHp + gain,
          hp: r.hero.hp + gain,
        };
      }
      return next;
    });
    setScreen("map");
  };
  const rest = (choice) => {
    setRun((r) => {
      const chapter = (route[r.node]?.chapter || 1) - 1;
      const hero = { ...r.hero };
      if (choice === "ad") hero.ad += [3, 4, 5][chapter];
      if (choice === "ap") hero.ap += [7, 9, 12][chapter];
      if (choice === "vitality") {
        const gain = [10, 14, 18][chapter];
        hero.maxHp += gain;
        hero.hp += gain;
      }
      if (choice === "energy") hero.energyBonus = (hero.energyBonus || 0) + 1;
      if (choice === "draw") hero.openingDraw = (hero.openingDraw || 0) + 1;
      if (choice === "crit") hero.crit = (hero.crit || 0) + [8, 10, 12][chapter];
      if (choice === "penetration") hero.armorPen = (hero.armorPen || 0) + [2, 3, 4][chapter];
      return { ...r, hero, node: r.node + 1 };
    });
    setScreen("map");
  };

  if (screen === "map")
    return <Map run={run} onChoose={chooseNode} onQuit={onQuit} />;
  if (screen === "battle")
    return (
      <Battle
        key={`${run.node}-${enemyId}`}
        run={run}
        enemyId={enemyId}
        onWin={winBattle}
        onLose={() => setScreen("defeat")}
        onQuit={onQuit}
      />
    );
  if (screen === "gear")
    return (
      <GearShop
        run={run}
        stock={stock}
        purchased={bought}
        onBuy={buyGear}
        onContinue={afterGear}
        onQuit={onQuit}
      />
    );
  if (screen === "skill")
    return <SkillReward run={run} onChoose={upgradeSkill} onQuit={onQuit} />;
  if (screen === "augment")
    return <Augment run={run} onChoose={chooseAugment} onQuit={onQuit} />;
  if (screen === "rest")
    return <Rest run={run} onChoose={rest} onQuit={onQuit} />;
  return <Result win={screen === "victory"} onBack={onQuit} />;
}

export default function App({ standalone = false }) {
  const [screen, setScreen] = useState(standalone ? "intro" : "home");
  const [championId, setChampionId] = useState("cho");
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [screen]);
  if (screen === "intro") return <FrozenIntro onComplete={() => setScreen("journey")} />;
  if (screen === "journey")
    return (
      <Lobby
        onBack={() => setScreen("home")}
        onStart={(id) => { setChampionId(id); setScreen("run"); }}
        standalone={standalone}
      />
    );
  if (screen === "run") return <GameRun championId={championId} onQuit={() => setScreen("journey")} />;
  return <Home onEnter={() => setScreen("journey")} />;
}
