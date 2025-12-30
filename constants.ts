
import { SlideData } from './types';

// Export categories so it can be used in Slide.tsx
export const categories = ["元旦", "知识问答", "体育", "名人名言", "随机"];
const values = [100, 200, 300, 400, 500];

// Define QuestionData interface to handle optional image property
interface QuestionData {
  q: string;
  a: string;
  img?: string;
}

// Main performance slides (Slides 1-17)
const mainSlides: SlideData[] = [
  { id: 1, title: "2026 元旦晚会", type: 'title' },
  { id: 2, title: "剧场表演：《三只小猪》", type: 'content', content: ["表演者：203宿舍", ""] },
  { id: 3, title: "朗诵：《短歌行》", type: 'content', content: ["表演者：204宿舍", ""] },
  { id: 4, title: "葫芦丝演奏：《最后一页》", type: 'content', content: ["表演者：兰立伟", ""] }, 
  { id: 5, title: "歌曲：《演员》", type: 'content', content: ["表演者：罗智峰、庄伟杰、付孟哲、梁秋亚、周一鹏", ""] },
  { id: 6, title: "歌曲：《爱情废柴》", type: 'content', content: ["演唱：林灏、刘德涵", ""] }, 
  { id: 7, title: "歌曲：《My Shot》", type: 'content', content: ["演唱：林佳炫、窦筱涵", "", ""] },
  { id: 8, title: "歌曲：《Someone Like You》", type: 'content', content: ["表演者：602宿舍", ""] }, 
  { id: 9, title: "歌曲：《大鱼》", type: 'content', content: ["演唱：袁畅、蔡咏辰", "", ""] },
  { id: 10, title: "班级大合唱", type: 'content', content: ["《海阔天空》"] }, 
  { id: 11, title: "互动：猜歌名", type: 'content', content: [] },
  { id: 12, title: "互动：海龟汤", type: 'content', content: [] },
  { id: 13, title: "互动：成语接龙", type: 'content', content: [] },
  { id: 14, title: "互动：击鼓传花", type: 'content', content: [] },
  { id: 15, title: "互动：抢蛋糕", type: 'content', content: [] },
  { id: 16, title: "互动：你画我猜", type: 'content', content: [] },
  { id: 17, title: "互动：数字炸弹", type: 'content', content: [] }
];

// Slide 18: Quiz Board (Jeopardy style)
const boardSlide: SlideData = { 
  id: 18, 
  title: "知识问答", 
  type: 'board', 
  content: categories 
};

// Questions for "元旦" Category
const yuandanQuestions: QuestionData[] = [
  { q: "我国古代哪个朝代开始将正月初一正式定名为“元旦”？", a: "汉朝" },
  { q: "我国古代曾以十月初一为元旦，这个立法是由哪位皇帝颁布推行的？", a: "汉武帝" },
  { q: "我们现在说的元旦是公历1月1日，在古代，元旦其实指的是哪一天？", a: "农历正月初一" },
  { q: "元旦在古代也被成为“元日”，“元”和“旦”分别代表什么意思？", a: "元是开始、第一，旦是早晨" },
  { 
    q: "世界上最早开始庆祝元旦的国家或者地区是哪里？", 
    a: "汤加（大洋洲）", 
    img: "https://images.unsplash.com/photo-1610214434778-9585694285df?q=80&w=1000&auto=format&fit=crop" 
  }
];

// Questions for "知识问答" Category
const zhishiQuestions: QuestionData[] = [
  { q: "____________________，望峰息心；", a: "鸢飞戾天者" },
  { q: "单反相机拍照时，为拍清远处景物，镜头应该______（前伸/后缩）", a: "前伸" },
  { q: "哪条河流流经国家数量最多？", a: "多瑙河" },
  { q: "成语“草木皆兵”源自哪场战役？", a: "淝水之战" },
  { q: "从3名男生和4名女生中选出3人参加知识竞赛，要求选出的3人中至少有一位是男生，一共有多少种不同的选法？", a: "31种" }
];

// Questions for "体育" Category
const tiyuQuestions: QuestionData[] = [
  { q: "马拉松全长：____ km（保留5为有效数字）", a: "42.195" },
  { q: "库里总共赢过多少次总冠军？", a: "4次" },
  { q: "NBA全称（英文）：", a: "National Basketball Association" },
  { 
    q: "奥运会的五环标志，分别代表哪个大洲？", 
    a: "蓝（欧洲）、黑（非洲）、红（美洲）、黄（亚洲）、绿（大洋洲）",
    img: "https://images.unsplash.com/photo-1569512046602-06900223f114?q=80&w=1000&auto=format&fit=crop"
  },
  { q: "“帽子戏法”最早起源于哪项运动？", a: "板球运动" }
];

// Questions for "名人名言" Category
const mingyanQuestions: QuestionData[] = [
  { q: "横眉冷对千夫指，俯首甘为孺子牛。", a: "鲁迅" },
  { q: "世界上只有一种英雄主义，就是看清生活的真相后依然热爱生活。", a: "罗曼·罗兰" },
  { q: "简单点~", a: "罗智峰" },
  { q: "生活就像海洋，只有意志坚强的人才能到达彼岸。", a: "马克思" },
  { q: "当你凝视深渊时，深渊也在凝视你", a: "尼采" }
];

// Questions for "随机" Category
const suijiQuestions: QuestionData[] = [
  { q: "我们日常使用的人民币纸币上，除了汉字，还印有哪几种文字？", a: "蒙古文、藏文、维吾尔文、壮文" },
  { q: "2025届宝安中学高一新生军训的时间是几号到几号", a: "8月24日-30日" },
  { q: "“出师未捷身先死，长使英雄泪满襟”这句诗描写的是哪位历史人物？", a: "诸葛亮" },
  { q: "一个数，去掉最高位是13，去掉最低位是40，这个数是多少？", a: "43 (四十三)" },
  { q: "张老师的生日是 m 月 n 日。候选日期：2/2, 2/3, 2/9, 6/5, 6/6, 6/9, 7/5, 7/8, 9/2, 9/6。\n小明知道月份，小强知道日期。\n小明：如果我不知道，那小强肯定也不知道。\n小强：本来我也不知道，现在我知道了。\n小明：哦，那我也知道了。\n请问生日是哪天？", a: "9月2日" }
];

// Slides 19-43: Quiz Content (5 categories * 5 = 25 slides)
const quizSlides: SlideData[] = [];
let quizId = 19;
categories.forEach((cat, catIdx) => {
  values.forEach((val, valIdx) => {
    let content = ["题目：", "回答：", "得分记录："];
    let image = undefined;

    if (cat === "元旦") {
      const qData = yuandanQuestions[valIdx];
      if (qData) {
        content = [qData.q, qData.a, ""];
        if (qData.img) image = qData.img;
      }
    } else if (cat === "知识问答") {
      const qData = zhishiQuestions[valIdx];
      if (qData) {
        content = [qData.q, qData.a, ""];
        if (qData.img) image = qData.img;
      }
    } else if (cat === "体育") {
      const qData = tiyuQuestions[valIdx];
      if (qData) {
        content = [qData.q, qData.a, ""];
        if (qData.img) image = qData.img;
      }
    } else if (cat === "名人名言") {
      const qData = mingyanQuestions[valIdx];
      if (qData) {
        content = [qData.q, qData.a, ""];
        if (qData.img) image = qData.img;
      }
    } else if (cat === "随机") {
      const qData = suijiQuestions[valIdx];
      if (qData) {
        content = [qData.q, qData.a, ""];
        if (qData.img) image = qData.img;
      }
    }

    quizSlides.push({
      id: quizId++,
      title: `${cat} - ${val}$ 题`,
      type: 'content',
      content: content,
      image: image
    });
  });
});

// Slide 44: Interaction "立" BA
const standBASlide: SlideData = { 
  id: 44, 
  title: "互动：“立” BA", 
  type: 'content', 
  content: ["", "", ""] 
 };

// Slide 45: Credits (Scrolling)
const creditsSlide: SlideData = { 
  id: 45, 
  title: "工作人员名单", 
  type: 'credits', 
  content: [
    "主持人：王蓦然、蔡咏辰",
    "活动策划：王蓦然",
    "活动审核：班主任",
    "PPT制作：周子栋",
    "编排排版：王蓦然",
    "摄影师：班主任、班级同学",
    "场地策划：班主任、王蓦然",
    "后勤部：家委及志愿者",
    "经济支持：班主任、家委",
    "板报设计：文艺委员、宣传委员、全体志愿同学",
    "活动类裁判：王募然、袁芷琪（张瑞琥）",
    "纪律管理：刘权锐、林灏",
    "道具组：班主任、家委",
    "意见征集：黄月莹、蔡咏辰",
    "灵感提供：仲泽晨、蔡咏辰",
    "",
    "致谢",
    "感谢全体工作人员、家委、班主任",
    "特别鸣谢：高一七班"
  ]
};

export const INITIAL_SLIDES: SlideData[] = [
  ...mainSlides,
  boardSlide,
  ...quizSlides,
  standBASlide,
  creditsSlide
];
