window.BW=window.BW||{};BW.vocab=BW.vocab||{};
// Each topic: {id, name, blurb, inter:[...], adv:[...]}
// Each word: [word, part of speech, meaning, example with {form used}, similar words, often used with]

/* ---------- Speaking Part 1: short, natural answers about everyday life ---------- */
BW.vocab.sp1=[
{id:"work",name:"Work and studies",blurb:"Describe your job or course with natural detail.",
inter:[
["workload","noun","the amount of work you have to do","My {workload} gets heavier before a product release.","amount of work, duties","a heavy workload, manage my workload"],
["colleague","noun","a person you work with","I get on really well with my {colleagues}.","coworker, teammate","a close colleague, colleagues and I"],
["deadline","noun","the time by which something must be finished","We are always under pressure to meet a {deadline}.","cut-off, due date","meet a deadline, a tight deadline"],
["shift","noun","a fixed period of time when you work","I usually work the morning {shift}, from nine to five.","working period","the morning shift, the night shift"],
["rewarding","adjective","giving you a feeling of satisfaction","Fixing a difficult bug is very {rewarding}.","fulfilling, satisfying","a rewarding job, find it rewarding"]
],
adv:[
["hands-on","adjective","involving real practical experience rather than theory","The job gives me a lot of {hands-on} experience.","practical","hands-on experience, a hands-on approach"],
["demanding","adjective","needing a lot of time, energy or skill","It’s a {demanding} role, but I enjoy the challenge.","challenging, taxing","a demanding job, physically demanding"],
["keep up with","verb phrase","to stay at the same level as something that keeps changing","I try to {keep up with} the latest tools in my field.","stay current with","keep up with trends, keep up with technology"],
["career ladder","noun phrase","the series of jobs through which a person can progress","I’d like to climb the {career ladder} in a software company.","career path","climb the career ladder"],
["juggle","verb","to manage several tasks or responsibilities at the same time","I often {juggle} work, study and family life.","balance, handle","juggle responsibilities, juggle work and study"]
]},
{id:"weather",name:"Weather and seasons",blurb:"Say how weather affects your mood and routine.",
inter:[
["humid","adjective","warm and damp, with a lot of moisture in the air","Summers here are hot and very {humid}.","muggy, sticky","hot and humid, humid weather"],
["breeze","noun","a light, gentle wind","A cool {breeze} makes the evenings pleasant.","light wind","a gentle breeze, a cool breeze"],
["downpour","noun","a sudden, very heavy fall of rain","We got caught in a sudden {downpour} on the way home.","heavy rain, deluge","a heavy downpour, caught in a downpour"],
["scorching","adjective","extremely hot","It was a {scorching} afternoon, so I stayed indoors.","boiling, blazing","scorching heat, a scorching day"],
["gloomy","adjective","dark and cloudy in a way that feels depressing","I feel a bit low on {gloomy} days.","overcast, dull","gloomy weather, a gloomy sky"]
],
adv:[
["unbearable","adjective","so bad that you cannot tolerate it","The heat can be {unbearable} in May.","intolerable","unbearable heat, almost unbearable"],
["monsoon","noun","the rainy season in South Asia","Everything turns green during the {monsoon}.","rainy season","the monsoon season, during the monsoon"],
["lift someone’s spirits","verb phrase","to make someone feel happier","A bright sunny morning always {lifts my spirits}.","cheer someone up","lift my spirits, lift the mood"],
["erratic","adjective","changing in an unpredictable way","The weather has been {erratic} lately.","unpredictable, unsettled","erratic weather, erratic behaviour"],
["take a toll on","verb phrase","to cause gradual damage or tiredness","Long, hot summers can {take a toll on} your energy.","wear down","take a toll on your health"]
]},
{id:"music",name:"Music and entertainment",blurb:"Explain what you listen to, when and why.",
inter:[
["soothing","adjective","calming and relaxing","I find classical music very {soothing}.","calming, relaxing","soothing music, a soothing voice"],
["catchy","adjective","easy to remember and enjoyable, like a tune","Pop songs are {catchy}, so they stay in my head.","memorable","a catchy tune, a catchy chorus"],
["lyrics","noun","the words of a song","I like songs with meaningful {lyrics}.","words of a song","meaningful lyrics, sing along to the lyrics"],
["atmosphere","noun","the mood or feeling of a place or event","The {atmosphere} at the concert was incredible.","vibe, ambience","a lively atmosphere, an electric atmosphere"],
["playlist","noun","a list of songs chosen to play in order","I have a {playlist} for long journeys.","song list","create a playlist, a workout playlist"]
],
adv:[
["uplifting","adjective","making you feel happier or more hopeful","I choose {uplifting} songs when I’m tired.","inspiring, cheering","uplifting music, an uplifting story"],
["nostalgic","adjective","feeling a sentimental longing for the past","Old songs make me feel {nostalgic}.","wistful, sentimental","feel nostalgic, a nostalgic song"],
["unwind","verb","to relax after work or stress","Music helps me {unwind} after a hectic day.","relax, decompress","unwind after work"],
["be into","verb phrase","to be very interested in something","I’m really {into} acoustic music these days.","enjoy, be keen on","be into jazz, be really into"],
["set the mood","verb phrase","to create a particular feeling","Soft music can {set the mood} for studying.","create an ambience","set the mood for"]
]},
{id:"sports",name:"Sports and fitness",blurb:"Talk about the sports you play and follow.",
inter:[
["stay in shape","verb phrase","to keep your body fit and healthy","I play football to {stay in shape}.","keep fit","stay in shape, help me stay in shape"],
["workout","noun","a session of physical exercise","I do a quick {workout} before work.","exercise session","a morning workout, a tough workout"],
["team spirit","noun phrase","the feeling of unity and shared purpose in a group","Playing cricket builds {team spirit}.","camaraderie","build team spirit, great team spirit"],
["stamina","noun","the energy and strength needed to keep going","Running has improved my {stamina}.","endurance","build stamina, physical stamina"],
["supporter","noun","a person who strongly supports a team","My brother is a loyal {supporter} of the national team.","fan, follower","a loyal supporter, a passionate supporter"]
],
adv:[
["avid","adjective","very keen and enthusiastic about something","I’m an {avid} cricket fan.","keen, passionate","an avid reader, an avid fan"],
["adrenaline","noun","a hormone that makes you feel excited and energetic","The final over was full of {adrenaline}.","excitement rush","an adrenaline rush"],
["go all out","verb phrase","to try as hard as possible","We {went all out} in the final match.","give it everything","go all out to win"],
["morale","noun","the confidence and spirit of a group","A win can lift the whole country’s {morale}.","spirit, confidence","boost morale, low morale"],
["sportsmanship","noun","fair and generous behaviour in sport","Good {sportsmanship} matters more than winning.","fair play","show sportsmanship, good sportsmanship"]
]},
{id:"news",name:"News and social media",blurb:"Describe how you get news and what you think of it.",
inter:[
["headline","noun","the title of a news story","I usually just skim the {headlines} on my phone.","title of a story","scan the headlines, a breaking news headline"],
["stay updated","verb phrase","to keep knowing the latest information","I use social media to {stay updated} on current events.","keep up to date","stay updated on"],
["reliable","adjective","able to be trusted","I only trust {reliable} sources.","trustworthy, dependable","a reliable source, reliable information"],
["notification","noun","a message that appears on your phone","Constant {notifications} distract me from work.","alert","turn off notifications, receive a notification"],
["current affairs","noun phrase","important events happening now in politics and society","I try to follow {current affairs} every day.","the news","keep up with current affairs"]
],
adv:[
["fact-check","verb","to check whether information is true","I {fact-check} surprising stories before sharing them.","verify","fact-check a claim"],
["go viral","verb phrase","to spread very quickly online","A video can {go viral} within hours.","spread rapidly","go viral online"],
["clickbait","noun","headlines designed to make you click, often misleading","I avoid {clickbait} because it wastes my time.","sensational headlines","fall for clickbait"],
["echo chamber","noun phrase","a situation where you only hear opinions you already agree with","Social media can trap people in an {echo chamber}.","filter bubble","trapped in an echo chamber"],
["skim","verb","to read quickly to get the main idea","I just {skim} articles instead of reading every word.","glance through","skim through an article"]
]},
{id:"home",name:"Home and hometown",blurb:"Describe where you live and what it is like.",
inter:[
["neighbourhood","noun","the area around where you live","I live in a quiet, friendly {neighbourhood}.","area, district","a safe neighbourhood, a friendly neighbourhood"],
["spacious","adjective","having plenty of room","Our flat is small but fairly {spacious}.","roomy","a spacious room, a spacious flat"],
["cosy","adjective","warm, comfortable and relaxing","My room is small but really {cosy}.","snug, comfortable","a cosy room, a cosy atmosphere"],
["convenient","adjective","easy to reach or use, and saving time","The metro makes the area very {convenient}.","handy, accessible","a convenient location, conveniently located"],
["hometown","noun","the town or city where you grew up","I grew up in my {hometown} and visit often.","native town","return to my hometown, my hometown"]
],
adv:[
["bustling","adjective","full of busy, noisy activity","The city centre is {bustling} at all hours.","lively, hectic","a bustling city, bustling streets"],
["tight-knit","adjective","closely connected by strong relationships","It’s a {tight-knit} community where everyone knows each other.","close, united","a tight-knit community, a tight-knit family"],
["put down roots","verb phrase","to settle in a place and feel it is home","I’d like to {put down roots} near my family.","settle","put down roots in"],
["charm","noun","an attractive quality that pleases people","The old town has a lot of {charm}.","appeal, character","full of charm, old-world charm"],
["overcrowded","adjective","containing too many people or things","The area has become {overcrowded} in recent years.","congested, packed","overcrowded streets, an overcrowded city"]
]}
];

/* ---------- Speaking Part 2: describing people, places, objects, events and experiences ---------- */
BW.vocab.sp2=[
{id:"people",name:"People you know",blurb:"Describe character, habits and influence.",
inter:[
["supportive","adjective","giving help and encouragement","My wife is incredibly {supportive} of my goals.","encouraging, caring","a supportive friend, supportive of"],
["generous","adjective","willing to give time, money or help freely","He’s one of the most {generous} people I know.","giving, kind-hearted","a generous person, generous with"],
["dependable","adjective","always doing what you promise","She’s {dependable}; you can always count on her.","trustworthy, loyal","a dependable friend, totally dependable"],
["easy-going","adjective","relaxed and not easily upset","My cousin is {easy-going} and rarely gets angry.","laid-back, relaxed","an easy-going person, an easy-going nature"],
["look up to","verb phrase","to admire and respect someone","I really {look up to} my father.","admire, respect","look up to someone as a role model"]
],
adv:[
["role model","noun phrase","a person whose behaviour others try to copy","My teacher was a great {role model} for me.","example, inspiration","a positive role model"],
["down-to-earth","adjective","practical, honest and not arrogant","Despite his success, he’s very {down-to-earth}.","humble, unpretentious","a down-to-earth person"],
["bring out the best in","verb phrase","to make someone show their finest qualities","She {brings out the best in} everyone around her.","inspire","bring out the best in people"],
["compassionate","adjective","feeling and showing concern for other people’s suffering","He’s {compassionate} towards people in need.","caring, kind","a compassionate person, compassionate towards"],
["a source of inspiration","noun phrase","someone or something that gives you ideas and motivation","She has been {a source of inspiration} throughout my career.","motivation","a constant source of inspiration"]
]},
{id:"places",name:"Places",blurb:"Paint a picture of a place and how it feels.",
inter:[
["scenery","noun","the natural features of a place, like hills and rivers","The {scenery} was absolutely breathtaking.","landscape, views","stunning scenery, beautiful scenery"],
["peaceful","adjective","quiet and calm","I love how {peaceful} the park is early in the morning.","calm, tranquil","a peaceful place, a peaceful atmosphere"],
["crowded","adjective","full of people","The market gets {crowded} on weekends.","packed, busy","crowded streets, a crowded place"],
["landmark","noun","a famous building or place that is easy to recognise","The fort is a well-known {landmark} of the city.","famous sight","a famous landmark, a historic landmark"],
["get away from it all","verb phrase","to go somewhere to escape stress or routine","I go there to {get away from it all}.","escape, retreat","get away from it all"]
],
adv:[
["breathtaking","adjective","extremely beautiful or impressive","The view from the hilltop was {breathtaking}.","stunning, spectacular","a breathtaking view, breathtaking beauty"],
["off the beaten track","adjective phrase","away from popular tourist places","We found a lovely village {off the beaten track}.","remote, secluded","somewhere off the beaten track"],
["tranquil","adjective","very calm and peaceful","The lake is incredibly {tranquil}.","serene, still","a tranquil setting, a tranquil atmosphere"],
["steeped in history","adjective phrase","having a long and interesting history","The old quarter is {steeped in history}.","historic, ancient","steeped in history and tradition"],
["vibrant","adjective","full of energy and life","The night market is {vibrant} and full of colour.","lively, dynamic","a vibrant city, a vibrant atmosphere"]
]},
{id:"objects",name:"Objects and gifts",blurb:"Explain what something is and why it matters.",
inter:[
["sentimental value","noun phrase","importance to you because of memories, not money","The watch has great {sentimental value} for me.","emotional value","great sentimental value, of sentimental value"],
["durable","adjective","strong and able to last a long time","It’s {durable} enough to survive daily use.","long-lasting, sturdy","durable material, a durable product"],
["practical","adjective","useful and sensible in real situations","It’s a very {practical} gift that I use every day.","useful, handy","a practical solution, a practical gift"],
["thoughtful","adjective","showing consideration for someone’s feelings or needs","It was a really {thoughtful} present.","considerate","a thoughtful gift, a thoughtful gesture"],
["cherish","verb","to keep something because it means a lot to you","I will always {cherish} this present.","treasure, value","cherish a memory, cherish a gift"]
],
adv:[
["keepsake","noun","a small object kept to remember a person or time","The bracelet is a precious {keepsake} from my grandmother.","memento, souvenir","a treasured keepsake"],
["can’t do without","verb phrase","to need something so much that you cannot manage without it","I really {can’t do without} my phone.","depend on","can’t do without something"],
["state-of-the-art","adjective","using the newest and most advanced technology","It has a {state-of-the-art} display.","cutting-edge","state-of-the-art equipment"],
["a token of appreciation","noun phrase","a small gift that shows thanks","They gave me a book as {a token of appreciation}.","gesture of thanks","a token of gratitude"],
["priceless","adjective","so valuable that it cannot be measured in money","To me the photograph is {priceless}.","invaluable","absolutely priceless, a priceless memory"]
]},
{id:"events",name:"Events and busy times",blurb:"Tell the story of a celebration or a hectic period.",
inter:[
["hectic","adjective","very busy and full of activity","Last month was incredibly {hectic} at work.","frantic, chaotic","a hectic schedule, a hectic day"],
["celebration","noun","a special event to mark something happy","We organised a small {celebration} at home.","party, festivity","a family celebration, a birthday celebration"],
["arrangement","noun","a plan or preparation made for an event","She had made all the {arrangements} in secret.","preparation","make arrangements, special arrangements"],
["gathering","noun","a meeting of people for a social purpose","It was a warm family {gathering}.","get-together","a family gathering, a social gathering"],
["in a rush","adjective phrase","hurrying because there is little time","I was always {in a rush} that week.","hurried","be in a rush, in a bit of a rush"]
],
adv:[
["overwhelmed","adjective","feeling unable to cope because there is too much to deal with","I felt {overwhelmed} by the amount of work.","swamped","feel overwhelmed, overwhelmed by"],
["snowed under","adjective phrase","having far more work than you can manage","I was {snowed under} with deadlines.","swamped, inundated","snowed under with work"],
["pull off","verb phrase","to succeed in doing something difficult","We somehow {pulled off} the launch on time.","manage, achieve","pull off a surprise"],
["memorable","adjective","worth remembering because it is special","It turned out to be a truly {memorable} evening.","unforgettable","a memorable occasion, truly memorable"],
["lavish","adjective","very rich, grand and expensive","The wedding was a {lavish} affair.","extravagant, opulent","a lavish party, lavish decorations"]
]},
{id:"experiences",name:"Experiences and lessons",blurb:"Narrate a time when something changed or taught you.",
inter:[
["come across","verb phrase","to find or meet something by chance","I {came across} an old photo album last week.","stumble upon","come across a problem"],
["end up","verb phrase","to finally be in a place or situation","I {ended up} staying late to finish it.","finish","end up doing, end up in"],
["figure out","verb phrase","to understand or solve something","It took me hours to {figure out} the problem.","work out","figure out a solution"],
["realise","verb","to suddenly understand a fact","I {realised} how much I had learned.","grasp, recognise","realise the importance of"],
["on the spur of the moment","adverb phrase","suddenly, without planning","We decided to travel {on the spur of the moment}.","impulsively","decide on the spur of the moment"]
],
adv:[
["a blessing in disguise","noun phrase","something that seems bad but turns out well","Missing the bus was {a blessing in disguise}.","hidden advantage","turn out to be a blessing in disguise"],
["out of your comfort zone","adverb phrase","in a situation that feels unfamiliar and challenging","It pushed me {out of my comfort zone}.","challenged","step out of your comfort zone"],
["take for granted","verb phrase","to value something too little because it is always there","People often {take for granted} the things they have.","undervalue","take something for granted"],
["in hindsight","adverb phrase","when thinking about the past with what you know now","{In hindsight}, it was the best decision I made.","looking back","in hindsight"],
["a turning point","noun phrase","a moment when an important change begins","That trip was {a turning point} in my life.","watershed","reach a turning point, a major turning point"]
]},
{id:"hobbies",name:"Hobbies and media",blurb:"Recommend a film, book, app or pastime.",
inter:[
["gripping","adjective","so exciting that you give it all your attention","The film was absolutely {gripping}.","thrilling, compelling","a gripping story, a gripping plot"],
["plot","noun","the series of events in a story","The {plot} kept me guessing until the end.","storyline","an interesting plot, a plot twist"],
["entertaining","adjective","enjoyable and amusing","It’s a light and {entertaining} series.","amusing, enjoyable","highly entertaining"],
["recommend","verb","to suggest that someone should try something","I’d highly {recommend} it to anyone.","suggest, advise","highly recommend"],
["pastime","noun","an activity you do regularly for enjoyment","Reading is my favourite {pastime}.","hobby, leisure activity","a favourite pastime"]
],
adv:[
["thought-provoking","adjective","making you think seriously about something","It’s a {thought-provoking} documentary.","stimulating","a thought-provoking film"],
["binge-watch","verb","to watch many episodes of a show in one go","I sometimes {binge-watch} series at the weekend.","marathon-watch","binge-watch a series"],
["be hooked on","verb phrase","to be unable to stop enjoying something","I’m completely {hooked on} this podcast.","be addicted to","get hooked on"],
["immerse yourself in","verb phrase","to become completely involved in something","Reading lets me {immerse myself in} another world.","lose yourself in","immerse yourself in a story"],
["a masterpiece","noun","an outstanding work of art","Many critics call it {a masterpiece}.","a classic","a cinematic masterpiece"]
]}
];
