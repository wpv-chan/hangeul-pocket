import {additions} from './words-0930.js';
// Transcribed from supplied photographs. Row numbers preserve provenance.
// Repeated entries with the same meaning share a learning record across lessons.
const rawLessons = [
  ['自我介绍', `직업|职业
학생|学生
선생님|老师
회사원|公司职员
경찰|警察
기자|记者
배우|演员
가수|歌手
주부|家庭主妇
의사|医生
나라|国家
한국|韩国
가나|加纳
독일|德国
러시아|俄罗斯
몽골|蒙古
미국|美国
베트남|越南
이집트|埃及
일본|日本
중국|中国
프랑스|法国
호주|澳大利亚
사람|人
자기소개|自我介绍
이름|名字
네|是；好的
씨|先生／女士（姓名后的称呼）
만나서 반갑습니다|很高兴见到您
안녕하세요|您好
어느 나라 사람이에요?|您是哪国人？
이름이 뭐예요?|您叫什么名字？
저|我（谦称）
직업이 뭐예요?|您的职业是什么？`],
  ['教室与物品', `교실|教室
물건|物品
책상|书桌
의자|椅子
칠판|黑板
문|门
창문|窗户
지도|地图
시계|钟表
가방|包
책|书
전자사전|电子词典
필통|铅笔盒
연필|铅笔
지우개|橡皮
볼펜|圆珠笔
핸드폰|手机
누구|谁（疑问代词）
뭐|什么（무엇 的口语缩略）
이|这（修饰名词）
이것|这个
제|我的（谦称）
한국어|韩语
그것|那个（靠近对方或前面提过的）
열쇠|钥匙
우산|雨伞
저|那（修饰名词，指远处）
저것|那个（远处的）
지갑|钱包
친구|朋友
컴퓨터|电脑
컵|杯子
아니요|不是；不`],
  ['日常活动', `자다|睡觉
만나다|见面
사다|买
보다|看
먹다|吃
읽다|读
마시다|喝
기다리다|等
가르치다|教
배우다|学；学习（向他人学）
쉬다|休息
공부(를) 하다|学习；用功|공부하다;공부를 하다
일(을) 하다|工作|일하다;일을 하다
말(을) 하다|说话|말하다;말을 하다
듣다|听
쓰다|写
하다|做
동사|动词
카드|卡
무엇|什么（完整形式）
뭘|什么（무엇을 的缩略，作宾语）
지금|现在
그림|画；图画
녹차|绿茶
물|水
밥|饭
빵|面包
사과|苹果
아이스크림|冰淇淋
영어|英语
영화|电影
음악|音乐
커피|咖啡
텔레비전|电视
편지|信`],
  ['地点与出行', `가다|去
다니다|上学；上班；经常往来
살다|住；生活
오다|来
운동(을) 하다|运动|운동하다;운동을 하다
쇼핑(을) 하다|购物|쇼핑하다;쇼핑을 하다
장소|场所
학교|学校
도서관|图书馆
서점|书店
식당|餐厅；食堂
커피숍|咖啡店
극장|电影院；剧场
집|家
기숙사|宿舍
회사|公司
가게|商店
백화점|百货商店
병원|医院
어디|哪里
라면|拉面
신발|鞋子
오늘|今天
여기|这里
거기|那里`],
  ['感受与生活', `재미있다|有趣
재미없다|无趣
맛있다|好吃
맛없다|不好吃
크다|大
작다|小
많다|多
적다|少
싸다|便宜
비싸다|贵
덥다|热（天气）
춥다|冷（天气）
쉽다|容易
어렵다|难
뜨겁다|烫；热（物体）
차갑다|凉；冰冷（物体）
있다|有；存在
귀엽다|可爱
좋다|好
맵다|辣
숙제(를) 하다|做作业|숙제하다;숙제를 하다
노래(를) 하다|唱歌|노래하다;노래를 하다
형용사|形容词
수업|课；上课
공부|学习（名词）
김치|泡菜
날씨|天气
동생|弟弟；妹妹
드라마|电视剧
옷|衣服
인형|玩偶；娃娃
비빔밥|拌饭
과일|水果
노래방|练歌房；KTV
그리고|还有；并且
어때요?|怎么样？
너무|太；非常
누가|谁（作主语）`],
  ['方位与数字', `있다|有；存在
없다|没有；不存在
위치|位置
위|上面
아래|下面
앞|前面
뒤|后面
안|里面
밖|外面
옆|旁边
숫자|数字
영/공|零|영;공
일|一
이|二
삼|三
사|四
오|五
육|六
칠|七
팔|八
구|九
십|十
백|百
천|千
만|万
지하|地下
층|层
고양이|猫
나무|树
남자|男人
달력|日历
돈|钱
방|房间
번|号码；次
사전|词典
약국|药店
여자|女人
자동차|汽车
전화번호|电话号码
침대|床
학생번호|学号
호|号（房间号）
화장실|洗手间
에어컨|空调
근처|附近
우체국|邮局
은행|银行
편의점|便利店
도|也`],
  ['日期与时间', `깨끗하다|干净
넓다|宽敞
월|月（月份单位）
1월|一月|일월
2월|二月|이월
3월|三月|삼월
4월|四月|사월
5월|五月|오월
6월|六月|유월
7월|七月|칠월
8월|八月|팔월
9월|九月|구월
10월|十月|시월
11월|十一月|십일월
12월|十二月|십이월
요일|星期
월요일|星期一
화요일|星期二
수요일|星期三
목요일|星期四
금요일|星期五
토요일|星期六
일요일|星期日
그저께|前天
어제|昨天
오늘|今天
내일|明天
모레|后天
며칠|几天；几号
시험|考试
언제|什么时候
이번|这次`],
];
rawLessons[6][1]+='\n'+additions[0].raw;
rawLessons.push(...additions.slice(1).map(l=>[l.title,l.raw]));
export const PHOTO_COUNT=23;
export const SOURCE_ROW_COUNT=rawLessons.reduce((n,[,raw])=>n+raw.split('\n').length,0);
export const lessons = rawLessons.map(([title,raw],i)=>({id:i+1,title,count:raw.split('\n').length}));
const newFile=n=>['Weixin Image_20260930202628_20928_15','Weixin Image_20260930202634_20929_15','Weixin Image_20260930202639_20930_15','Weixin Image_20260930202644_20931_15','Weixin Image_20260930202648_20932_15','Weixin Image_20260930202653_20933_15','Weixin Image_20260930202657_20934_15','Weixin Image_20260930202714_20935_15','Weixin Image_20260930202723_20936_15','Weixin Image_20260930202746_20937_15','Weixin Image_20260930202750_20938_15','Weixin Image_20260930202758_20939_15','Weixin Image_20260930202803_20940_15','Weixin Image_20260930202809_20941_15','Weixin Image_20260930202814_20942_15'][n-1];
const sourceRows = [
  [[1,30,'0deecbbbcc6cb37bc18146dfbdfcadfc'],[31,34,'3f96fcd77d6ce5338d3047cea1a4e8e3']],
  [[1,24,'3f96fcd77d6ce5338d3047cea1a4e8e3'],[25,33,'4246f6884ec6398cae39f4717b06a4b4']],
  [[1,23,'4246f6884ec6398cae39f4717b06a4b4'],[24,35,'7a56ae66f9da0aea03c1ba50a4afd7aa']],
  [[1,20,'7a56ae66f9da0aea03c1ba50a4afd7aa'],[21,25,'91f177fdb076838e377b9ba595ce93a8']],
  [[1,25,'91f177fdb076838e377b9ba595ce93a8'],[26,38,'76fb1c1a83b2036f5a80925352610468']],
  [[1,18,'76fb1c1a83b2036f5a80925352610468'],[19,49,'cdf1a6cab5c9dc0c1811f2600e9e4adf']],
  [[1,31,'1162d7688fad25ed07155132068c2f08'],[32,32,'cdf1a6cab5c9dc0c1811f2600e9e4adf'],[33,51,newFile(1)]],
];
sourceRows.push(
  [[1,25,newFile(1)]],
  [[1,14,newFile(1)],[15,26,newFile(2)]],
  [[1,45,newFile(2)],[46,49,newFile(3)]],
  [[1,20,newFile(3)]],
  [[1,37,newFile(3)],[38,43,newFile(4)]],
  [[1,36,newFile(4)]],
  [[1,37,newFile(5)]],
  [[1,25,newFile(5)],[26,32,newFile(6)]],
  [[1,27,newFile(6)]],
  [[1,26,newFile(6)],[27,34,newFile(7)]],
  [[1,26,newFile(7)]],
  [[1,22,newFile(7)],[23,30,newFile(10)]],
  [[1,46,newFile(10)]],
  [[1,25,newFile(11)]],
  [[1,28,newFile(11)]],
  [[1,2,newFile(11)],[3,21,newFile(12)]],
  [[1,31,newFile(12)],[32,33,newFile(13)]],
  [[1,15,newFile(13)]],
  [[1,25,newFile(13)]],
  [[1,8,newFile(13)],[9,24,newFile(14)]],
  [[1,22,newFile(14)]],
  [[1,15,newFile(14)],[16,28,newFile(15)]],
  [[1,21,newFile(15)]]
);
const wordsMap = new Map(),answerMap=new Map();
const answerKey=(answer,zh)=>answer.normalize('NFC').replace(/\s/g,'')+'|'+zh;
rawLessons.forEach(([,raw],i)=>raw.split('\n').forEach((line,j)=>{
  const [ko,zh,alternatives] = line.split('|');
  const answers=alternatives?alternatives.split(';'):i>=7&&/\([을를이]\)/.test(ko)?[ko.replace(/\([을를이]\)/g,''),ko.replace(/[()]/g,'')]:[ko];
  const source = {lesson:i+1,row:j+1,file:sourceRows[i].find(([a,b])=>j+1>=a&&j+1<=b)[2]+'.jpg'};
  const existing=wordsMap.get(`${ko}|${zh}`)||answers.map(a=>answerMap.get(answerKey(a,zh))).find(Boolean);
  if(existing){if(!existing.lessons.includes(i+1))existing.lessons.push(i+1);existing.sources.push(source);for(const a of answers)if(!existing.answers.includes(a))existing.answers.push(a);existing.answers.forEach(a=>answerMap.set(answerKey(a,zh),existing));return;}
  const word={id:`l${i+1}-${j+1}`,ko,zh,answers,speak:answers[0],lessons:[i+1],sources:[source]};
  wordsMap.set(`${ko}|${zh}`,word);answers.forEach(a=>answerMap.set(answerKey(a,zh),word));
}));
// These two new photos confirm existing rows; they add provenance, not duplicate cards.
for(const word of wordsMap.values())for(const source of [...word.sources]){
  const n=source.lesson===4&&source.row>=21||source.lesson===5||source.lesson===6&&source.row<=18?8:source.lesson===6&&source.row>=19||source.lesson===7&&source.row<=31?9:source.lesson===7&&source.row===32?1:null;
  if(n)word.sources.push({...source,file:newFile(n)+'.jpg'});
}
export const words = [...wordsMap.values()];
for(const word of words)if(word.sources[0].lesson>7||word.sources[0].lesson===7&&word.sources[0].row>32)word.addedDate='2026-09-30';
export const NEW_WORD_COUNT=words.filter(w=>w.addedDate==='2026-09-30').length;

// Curated equivalent answers, never infer equivalence from Chinese text alone.
const equivalentGroups=[['l2-23','l16-24'],['l3-1','l13-30'],['l5-22','l29-24'],['l7-51','l16-25'],['l8-8','l27-2'],['l9-24','l20-41'],['l13-15','l27-8'],['l13-27','l21-25'],['l18-4','l26-23'],['l18-18','l27-7']];
for(const ids of equivalentGroups){const group=words.filter(w=>ids.includes(w.id));const answers=[...new Set(group.flatMap(w=>w.answers))];for(const w of group){w.equivalentIds=ids;w.answers=[...new Set([...w.answers,...answers])];}}
const spellingPrompts={'l4-5':'运动（动词：做运动）','l12-27':'运动（名词）','l8-10':'洗澡（淋浴；外来语表达）','l22-7':'洗澡（沐浴；汉字词表达）'};
for(const w of words)if(spellingPrompts[w.id])w.spellingPrompt=spellingPrompts[w.id];
