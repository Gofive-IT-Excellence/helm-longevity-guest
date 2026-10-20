// Original, lightweight SVG movement guides. No third-party exercise media is embedded.
const HELM_EXERCISE_POSES = {
  stand: [
    {head:[153,42],shoulder:[148,68],hip:[150,119],elbow:[135,96],wrist:[146,117],otherElbow:[166,93],otherWrist:[169,113],knee:[138,151],ankle:[133,180],otherKnee:[165,152],otherAnkle:[170,180]},
    {head:[153,42],shoulder:[148,68],hip:[150,119],elbow:[135,96],wrist:[146,117],otherElbow:[166,93],otherWrist:[169,113],knee:[138,151],ankle:[133,180],otherKnee:[165,152],otherAnkle:[170,180]}
  ],
  wall: [
    {head:[139,45],shoulder:[146,68],hip:[133,120],elbow:[199,82],wrist:[266,67],otherElbow:[203,98],otherWrist:[266,77],knee:[121,151],ankle:[99,181],otherKnee:[140,153],otherAnkle:[117,181]},
    {head:[194,50],shoulder:[198,73],hip:[160,126],elbow:[235,91],wrist:[266,67],otherElbow:[234,104],otherWrist:[266,77],knee:[136,154],ankle:[99,181],otherKnee:[150,157],otherAnkle:[117,181]}
  ],
  squat: [
    {head:[151,38],shoulder:[149,64],hip:[149,115],elbow:[136,37],wrist:[130,13],otherElbow:[164,37],otherWrist:[170,13],knee:[139,149],ankle:[135,181],otherKnee:[169,149],otherAnkle:[173,181]},
    {head:[143,62],shoulder:[139,86],hip:[117,132],elbow:[121,106],wrist:[168,102],otherElbow:[153,108],otherWrist:[176,105],knee:[165,148],ankle:[174,181],otherKnee:[184,145],otherAnkle:[190,181]}
  ],
  calf: [
    {head:[154,42],shoulder:[150,67],hip:[150,119],elbow:[140,95],wrist:[137,115],otherElbow:[166,95],otherWrist:[171,114],knee:[144,151],ankle:[139,181],otherKnee:[165,151],otherAnkle:[168,181]},
    {head:[154,27],shoulder:[150,52],hip:[150,104],elbow:[140,80],wrist:[137,100],otherElbow:[166,80],otherWrist:[171,99],knee:[144,136],ankle:[139,166],otherKnee:[165,136],otherAnkle:[168,166]}
  ],
  bridge: [
    {head:[72,147],shoulder:[98,149],hip:[153,154],elbow:[82,160],wrist:[68,166],otherElbow:[100,162],otherWrist:[90,169],knee:[210,117],ankle:[230,171],otherKnee:[223,119],otherAnkle:[245,171]},
    {head:[72,147],shoulder:[98,149],hip:[154,104],elbow:[82,160],wrist:[68,166],otherElbow:[100,162],otherWrist:[90,169],knee:[210,117],ankle:[230,171],otherKnee:[223,119],otherAnkle:[245,171]}
  ],
  pushup: [
    {head:[95,71],shoulder:[119,88],hip:[187,90],elbow:[139,119],wrist:[143,167],otherElbow:[151,124],otherWrist:[156,167],knee:[234,111],ankle:[271,157],otherKnee:[240,117],otherAnkle:[278,158]},
    {head:[98,111],shoulder:[122,130],hip:[187,130],elbow:[138,142],wrist:[143,167],otherElbow:[153,144],otherWrist:[156,167],knee:[234,131],ankle:[271,157],otherKnee:[240,136],otherAnkle:[278,158]}
  ],
  incline: [
    {head:[93,53],shoulder:[115,71],hip:[183,90],elbow:[142,97],wrist:[162,129],otherElbow:[151,101],otherWrist:[173,129],knee:[230,114],ankle:[265,167],otherKnee:[239,120],otherAnkle:[275,167]},
    {head:[125,87],shoulder:[145,105],hip:[192,114],elbow:[156,117],wrist:[162,129],otherElbow:[169,118],otherWrist:[173,129],knee:[232,129],ankle:[265,167],otherKnee:[240,134],otherAnkle:[275,167]}
  ],
  lunge: [
    {head:[153,40],shoulder:[148,66],hip:[150,119],elbow:[131,94],wrist:[134,115],otherElbow:[166,93],otherWrist:[170,115],knee:[143,152],ankle:[141,181],otherKnee:[165,152],otherAnkle:[168,181]},
    {head:[160,51],shoulder:[155,77],hip:[157,127],elbow:[139,105],wrist:[142,124],otherElbow:[172,105],otherWrist:[176,124],knee:[207,146],ankle:[210,181],otherKnee:[109,149],otherAnkle:[88,181]}
  ],
  plank: [
    {head:[87,76],shoulder:[111,94],hip:[185,97],elbow:[113,127],wrist:[111,163],otherElbow:[129,130],otherWrist:[128,163],knee:[230,151],ankle:[266,166],otherKnee:[239,155],otherAnkle:[275,168]},
    {head:[87,76],shoulder:[111,94],hip:[185,97],elbow:[139,91],wrist:[158,96],otherElbow:[129,130],otherWrist:[128,163],knee:[230,151],ankle:[266,166],otherKnee:[239,155],otherAnkle:[275,168]}
  ],
  twist: [
    {head:[87,76],shoulder:[111,94],hip:[185,97],elbow:[113,127],wrist:[111,163],otherElbow:[129,130],otherWrist:[128,163],knee:[227,117],ankle:[267,151],otherKnee:[238,123],otherAnkle:[276,153]},
    {head:[96,55],shoulder:[117,82],hip:[185,97],elbow:[115,51],wrist:[108,25],otherElbow:[129,130],otherWrist:[128,163],knee:[227,117],ankle:[267,151],otherKnee:[238,123],otherAnkle:[276,153]}
  ],
  curl: [
    {head:[156,41],shoulder:[150,68],hip:[151,119],elbow:[133,97],wrist:[129,122],otherElbow:[170,98],otherWrist:[174,122],knee:[141,151],ankle:[138,180],otherKnee:[165,151],otherAnkle:[169,180]},
    {head:[156,41],shoulder:[150,68],hip:[151,119],elbow:[133,97],wrist:[149,70],otherElbow:[170,98],otherWrist:[154,70],knee:[141,151],ankle:[138,180],otherKnee:[165,151],otherAnkle:[169,180]}
  ],
  lateral: [
    {head:[156,41],shoulder:[150,68],hip:[151,119],elbow:[133,96],wrist:[132,121],otherElbow:[169,96],otherWrist:[171,121],knee:[141,151],ankle:[138,180],otherKnee:[165,151],otherAnkle:[169,180]},
    {head:[156,41],shoulder:[150,68],hip:[151,119],elbow:[109,69],wrist:[73,72],otherElbow:[192,69],otherWrist:[228,72],knee:[141,151],ankle:[138,180],otherKnee:[165,151],otherAnkle:[169,180]}
  ],
  pullup: [
    {head:[153,64],shoulder:[150,88],hip:[151,134],elbow:[109,65],wrist:[100,31],otherElbow:[193,65],otherWrist:[202,31],knee:[140,157],ankle:[135,181],otherKnee:[164,157],otherAnkle:[169,181]},
    {head:[153,40],shoulder:[150,64],hip:[151,110],elbow:[109,63],wrist:[100,31],otherElbow:[193,63],otherWrist:[202,31],knee:[140,133],ankle:[135,157],otherKnee:[164,133],otherAnkle:[169,157]}
  ],
  situp: [
    {head:[62,137],shoulder:[94,153],hip:[165,158],elbow:[67,116],wrist:[91,109],otherElbow:[79,117],otherWrist:[102,111],knee:[218,116],ankle:[246,166],otherKnee:[229,118],otherAnkle:[258,166]},
    {head:[124,56],shoulder:[139,82],hip:[165,158],elbow:[120,61],wrist:[144,61],otherElbow:[132,67],otherWrist:[153,65],knee:[218,116],ankle:[246,166],otherKnee:[229,118],otherAnkle:[258,166]}
  ]
};

const HELM_EXERCISE_MOTIONS = {
  "0001":"situp","0659":"wall","1685":"squat","1373":"calf","3013":"bridge","0493":"incline","0662":"pushup","1460":"lunge","3239":"plank","0294":"curl","0334":"lateral","0652":"pullup","0464":"twist"
};

function trainerMotionSvg(item) {
  const key=HELM_EXERCISE_MOTIONS[item.id] || "stand";
  const [start,end]=HELM_EXERCISE_POSES[key];
  const reduce=window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const point=(pose,part)=>pose[part].join(" ");
  const segment=(parts,color,width=12)=>{
    const path=pose=>`M ${point(pose,parts[0])} L ${point(pose,parts[1])}${parts[2] ? ` L ${point(pose,parts[2])}` : ""}`;
    return `<path d="${path(start)}" stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round" fill="none">${reduce ? "" : `<animate attributeName="d" values="${path(start)};${path(end)};${path(start)}" dur="2.4s" repeatCount="indefinite"/>`}</path>`;
  };
  const head=`<circle cx="${start.head[0]}" cy="${start.head[1]}" r="15" fill="#fff" stroke="#315f8d" stroke-width="5">${reduce ? "" : `<animate attributeName="cx" values="${start.head[0]};${end.head[0]};${start.head[0]}" dur="2.4s" repeatCount="indefinite"/><animate attributeName="cy" values="${start.head[1]};${end.head[1]};${start.head[1]}" dur="2.4s" repeatCount="indefinite"/>`}</circle>`;
  const color=part=>item.highlight?.includes(part) ? "#ff755d" : "#3876b8";
  const equipment=key==="wall" ? '<path d="M277 22V183" stroke="#9fc3df" stroke-width="6" stroke-linecap="round"/>' : key==="pullup" ? '<path d="M72 27H229" stroke="#9fc3df" stroke-width="7" stroke-linecap="round"/>' : key==="incline" ? '<path d="M150 134H201V186" stroke="#9fc3df" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' : "";
  return `<svg class="trainer-motion" viewBox="0 0 320 200" role="img" aria-label="ภาพเคลื่อนไหวสาธิตท่า ${esc(item.name)} ส่วนสีส้มแสดงกล้ามเนื้อที่เน้น"><rect width="320" height="200" rx="20" fill="#eaf6ff"/><path d="M25 185H295" stroke="#c9dfed" stroke-width="3"/>${equipment}${segment(["hip","otherKnee","otherAnkle"],color("legs"),14)}${segment(["shoulder","otherElbow","otherWrist"],color("arms"),11)}${segment(["shoulder","hip"],color("core"),18)}${segment(["hip","knee","ankle"],color("legs"),14)}${segment(["shoulder","elbow","wrist"],color("arms"),11)}${head}<circle cx="270" cy="30" r="6" fill="#ff755d"/><text x="282" y="34" fill="#4b6e91" font-size="10">จุดเน้น</text></svg>`;
}
