import creatorPhoto from "@/assets/creator-ananya.jpg";
import backwaters from "@/assets/portfolio-backwaters.jpg";
import sadya from "@/assets/portfolio-sadya.jpg";
import fashion from "@/assets/portfolio-fashion.jpg";
import munnar from "@/assets/portfolio-munnar.jpg";
import varkala from "@/assets/portfolio-varkala.jpg";

export const creator = {
  id: "cr_ind_001", name: "Ananya Nair", displayName: "Ananya Explores", handle: "@ananyaexplores",
  category: "Travel · Food · Lifestyle", location: "Mumbai, India", verified: true, completion: 85,
  photo: creatorPhoto, cover: backwaters, bio: "Stories from across India — slow travel, street food and places worth crossing the country for.",
  about: "I create vivid, thoughtful stories around India's places, plates and people. My work helps travel and lifestyle brands feel local, useful and beautifully human.",
  languages: ["English", "Hindi", "Malayalam"], creatorType: "Lifestyle & Travel Creator",
  email: "hello@ananyaexplores.in", profileUrl: "influencers.com/ananyaexplores", websiteUrl: "ananya.influencers.com",
};

export const stats = [
  { label: "Profile views", value: "24.8K", change: "+18.2%", series: [18,24,22,30,27,38,42] },
  { label: "Website visitors", value: "8,642", change: "+12.4%", series: [12,18,14,24,30,28,35] },
  { label: "Social followers", value: "438K", change: "+5.8%", series: [24,25,27,29,31,34,37] },
  { label: "Collab requests", value: "36", change: "+8 this month", series: [8,14,12,19,16,24,28] },
];

export const socialAccounts = [
  { id:"soc_01", platform:"Instagram", username:"@ananyaexplores", followers:"284K", following:"892", engagement:"5.8%", verified:true, updated:"2 hours ago", connected:true },
  { id:"soc_02", platform:"YouTube", username:"Ananya Explores", followers:"126K", following:"—", engagement:"6.2%", verified:true, updated:"Yesterday", connected:true },
  { id:"soc_03", platform:"Threads", username:"@ananyaexplores", followers:"18.6K", following:"318", engagement:"4.1%", verified:false, updated:"3 days ago", connected:true },
  { id:"soc_04", platform:"Pinterest", username:"Ananya Explores India", followers:"9.4K", following:"112", engagement:"3.7%", verified:false, updated:"1 week ago", connected:true },
];

export const portfolio = [
  { id:"port_01", title:"Stillness on the Backwaters", category:"Travel", brand:"Incredible Voyages", date:"Sep 2026", image:backwaters, format:"Reel", views:"486K", tags:["Alappuzha","Slow travel"] },
  { id:"port_02", title:"A Modern Festive Table", category:"Food", brand:"Nila Kitchens", date:"Aug 2026", image:sadya, format:"Campaign", views:"312K", tags:["Festive","Indian food"] },
  { id:"port_03", title:"Handloom, Reimagined", category:"Fashion", brand:"Maya Weaves", date:"Aug 2026", image:fashion, format:"Editorial", views:"274K", tags:["Handloom","Mumbai"] },
  { id:"port_04", title:"Munnar Before the World Wakes", category:"Travel", brand:"Wild Routes", date:"Jul 2026", image:munnar, format:"Video", views:"629K", tags:["Munnar","Hiking"] },
  { id:"port_05", title:"A Weekend Above Varkala", category:"Lifestyle", brand:"Cliff House", date:"Jun 2026", image:varkala, format:"Campaign", views:"358K", tags:["Varkala","Stay"] },
];

export const services = [
  { id:"srv_01", name:"Instagram Reel", description:"Concept-led vertical video with original voiceover and edit.", price:"₹35,000", deliverables:"1 reel · 3 story frames", turnaround:"7–10 days", active:true },
  { id:"srv_02", name:"Travel Story Package", description:"Immersive destination story across short and long-form formats.", price:"₹85,000", deliverables:"2 reels · 8 stories · 12 photos", turnaround:"14 days", active:true },
  { id:"srv_03", name:"UGC Content", description:"Natural product storytelling licensed for brand channels.", price:"₹22,000", deliverables:"2 edited videos · raw selects", turnaround:"7 days", active:true },
  { id:"srv_04", name:"Event Appearance", description:"Creator appearance, live coverage and post-event recap.", price:"Contact for price", deliverables:"Up to 4 hours · live stories", turnaround:"By schedule", active:false },
  { id:"srv_05", name:"Product Photography", description:"Warm editorial product imagery in an Indian lifestyle setting.", price:"₹28,000", deliverables:"15 edited photographs", turnaround:"10 days", active:true },
];

export const opportunities = [
  { id:"opp_01", name:"Monsoon in the Hills", business:"Misty Trails Resorts", category:"Travel", location:"Wayanad", platform:"Instagram", deliverables:"2 reels + 6 stories", budget:"₹60K–₹85K", deadline:"Oct 12", creators:3, match:96 },
  { id:"opp_02", name:"Great Indian Breakfast Stories", business:"Malabar Harvest", category:"Food", location:"Pan-India", platform:"Instagram, YouTube", deliverables:"1 reel + 1 short", budget:"₹45K–₹65K", deadline:"Oct 18", creators:5, match:91 },
  { id:"opp_03", name:"Responsible Coastlines", business:"Blue Earth Collective", category:"Sustainability", location:"Goa", platform:"YouTube", deliverables:"1 feature video", budget:"₹90K–₹1.2L", deadline:"Oct 24", creators:2, match:88 },
  { id:"opp_04", name:"Festive Handloom Edit", business:"Thari Studio", category:"Fashion", location:"Jaipur", platform:"Instagram", deliverables:"1 reel + 1 carousel", budget:"₹40K–₹55K", deadline:"Nov 2", creators:4, match:84 },
];

export const inquiries = [
  { id:"inq_01", business:"Maya Weaves", campaign:"Diwali Handloom Edit", message:"We loved your handloom story and would like to explore a festive collaboration.", budget:"₹65,000", date:"Today, 9:42 AM", status:"New" },
  { id:"inq_02", business:"Coconut Grove Hotels", campaign:"Quiet Coastal Escapes", message:"Could you share availability for a three-night property experience in Goa?", budget:"₹95,000", date:"Yesterday", status:"Negotiating" },
  { id:"inq_03", business:"Nila Kitchens", campaign:"Festive Table", message:"Thank you for the beautiful campaign. We'd love to reserve a Christmas slot.", budget:"₹48,000", date:"Sep 25", status:"Responded" },
  { id:"inq_04", business:"Terra Footwear", campaign:"Walk Local", message:"Inviting you to our pan-India creator campaign this November.", budget:"₹72,000", date:"Sep 22", status:"Accepted" },
];

export const notifications = [
  { id:"n1", title:"New collaboration inquiry", text:"Maya Weaves sent a festive campaign brief.", time:"8 min", unread:true, type:"inquiry" },
  { id:"n2", title:"Campaign invitation", text:"Misty Trails invited you to Monsoon in the Hills.", time:"2h", unread:true, type:"campaign" },
  { id:"n3", title:"Profile verified", text:"Your professional profile is now verified.", time:"Yesterday", unread:false, type:"verified" },
  { id:"n4", title:"Portfolio is trending", text:"Your Munnar reel crossed 600K views.", time:"2d", unread:false, type:"activity" },
];

export const analytics = [
  { day:"Sep 1", views:1800, visitors:620, clicks:210 }, { day:"Sep 5", views:2400, visitors:760, clicks:280 },
  { day:"Sep 9", views:2100, visitors:710, clicks:260 }, { day:"Sep 13", views:3200, visitors:980, clicks:350 },
  { day:"Sep 17", views:2900, visitors:920, clicks:390 }, { day:"Sep 21", views:4100, visitors:1240, clicks:470 },
  { day:"Sep 26", views:4800, visitors:1410, clicks:560 },
];

export const websiteTemplates = ["Minimal Creator", "Fashion", "Travel", "Food", "Lifestyle", "Professional", "Photography", "Gaming"];
