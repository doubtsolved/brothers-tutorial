import fs from 'fs'
import { join } from 'path'

const mockFilePath = join(process.cwd(), 'kv_local_store.json')

// Default structural schema setup parameters out of the box
const initialSchema = {
  sections: {
    bannerText: "🎓 ২০২৬-২৭ শিক্ষাবর্ষে ভর্তি চলছে",
    heroTagline: "ESTD. 2021",
    heroHeading: " can change live over the cloud now!",
    heroSubheading: "Zero-bloat, edge-native infrastructure.",
    heroImageUrl: "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg",
    logoUrl: "",
    aboutHeading: "Life at Brothers Tutorial",
    aboutDescription: "A glimpse into our vibrant educational environment.",
    pillarsHeading: "Our Academic Pillars",
    pillarsDescription: "A structured approach designed to ensure academic excellence.",
    p1Title: "বিদ্যালয় কেন্দ্রিক", p1Desc: "Curriculum tracking.",
    p2Title: "सामগ্রিক উন্নতি", p2Desc: "Holistic student approach.",
    p3Title: "বিশেষজ্ঞ শিক্ষক", p3Desc: "Expert educators.",
    p4Title: "মাসিক পরীক্ষা", p4Desc: "Consistent evaluations.",
    policyText: "Please collect registration forms from the front office.",
    addressText: "Baruipara, Nadia, West Bengal, India",
    footerPhone: "+91 90936 68632",
    footerEmail: "brotherstutorialofficial@gmail.com"
  },
  carousel: [],
  notices: [],
  downloads: []
}

if (!fs.existsSync(mockFilePath)) {
  fs.writeFileSync(mockFilePath, JSON.stringify(initialSchema, null, 2))
}

export const getLocalKV = async () => {
  return fs.readFileSync(mockFilePath, 'utf-8')
}

export const putLocalKV = async (value: string) => {
  fs.writeFileSync(mockFilePath, value, 'utf-8')
}
