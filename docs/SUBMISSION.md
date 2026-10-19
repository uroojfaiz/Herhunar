# HerHunar: submission text and video script

## Fields for the submission form
Project Name: HerHunar
Team Name: (add)
Team Members: (add names and roles)
Live Demo URL: (add)
GitHub Repository URL: (add)
Demo Video URL: (add)
AI Tools Used: Anthropic Claude API (matching, voice-to-listing, price suggestion, chatbot); AI coding assistant during development
Known Limitations: Voice input works in Chrome or Edge only; translations beyond English and Urdu are partial; payments and CNIC verification are future work; seeded profiles are demo data.

## Problem statement
In Pakistan, many women have skills such as tailoring, home cooking, beauty services and tutoring, but cultural and practical limits keep them at home. They have no easy way to build a name or reach customers, so their skills earn little. Customers also struggle to find a trusted woman for these services nearby, and many people on both sides are not comfortable with typing, English or complicated apps.

## Solution overview (copy-paste description)
HerHunar is a mobile-friendly marketplace where home-based women, called hunarmands, list their skills and customers find them nearby. The difference is the AI at the centre of every step.

A customer simply says or types what they need, for example "I need two suits stitched before Eid, budget 2500". Our AI Match reads that request, compares it with every real service on the platform, and returns the best three matches with a short reason and a fair price to offer. It cannot invent a provider, because every result is checked against the real list, and if the AI is unavailable the app falls back to basic keyword matching and says so.

For hunarmands, creating a listing needs no typing. She speaks in Urdu, and the AI writes the title, description and category, then suggests a fair price range. Every hunarmand gets an Instagram-style page where she posts photos of her work, so customers can see her quality before they ask. Customers send a price offer, she accepts or counters, and they talk through private in-app messages or continue on WhatsApp in one tap.

Safety was designed in: exact addresses are never stored, public location is rounded to about 1 km, neighbours can vouch for a hunarmand to earn a verified badge, and any profile can be reported. The app speaks six Pakistani languages, supports right-to-left text, has five themes including high contrast, adjustable text size and an Easy mode, and works on phones, tablets and desktops.

Built with React, Node.js, Express and MongoDB, deployed on Vercel, with Claude from Anthropic as the AI layer. Our goal is simple: turn a woman's hunar into a business without asking her to leave home.

## Demo video script (about 90 seconds, record a real run in Chrome)
0:00 to 0:10, on camera or title card. "In Pakistan, millions of women have a hunar, but no way to reach customers. This is HerHunar."

0:10 to 0:20, show the home page. "Customers search by skill or area, see providers on a live map, and can filter women-only or near me."

0:20 to 0:45, the main AI moment. Log in as the customer, tap the mic and say your request, or type it. Click Find my best match. "Our AI reads the request, compares it with every real service, and picks the best three, each with a reason and a fair price."

0:45 to 1:05, switch to a hunarmand account. Tap the mic in My Work and speak in Urdu. "She just speaks. AI writes the listing and suggests a fair price. No typing, no English needed."

1:05 to 1:20, open the hunarmand's profile page to show her photo grid, then send a price offer and open the Message chat. "Her page works like Instagram, so customers see her real work. The customer sends a price offer and chats with her privately, or continues on WhatsApp."

1:20 to 1:30, show vouch, verified badge, theme and language switch quickly. "Trust is built in: neighbour vouching, reporting, and no exact addresses. It works in six languages and on any screen."

1:30 to 1:35, end card. "HerHunar: your skill, your business." Show the project name and live link.

Video tips: record only what really works, show the live link in the address bar, mention that sample profiles are demo data, and keep the voice calm and clear.

## Questions judges may ask
How is the AI meaningful and not just an API call? Claude does the ranking and reasoning in AI Match, writes listings from speech, and prices services; the server only pre-filters and validates.
How do you stop wrong AI answers? Returned ids are validated against real services, results fall back to basic matching, and prices are only suggestions the user can change.
Why WhatsApp? Women and customers already use it, so no new chat habit and no extra cost.
How do you keep women safe? No exact address, location rounded, vouching, report button, and the choice of women-only search.
What would you build next? Payments through Easypaisa and JazzCash, CNIC-backed verification, in-app chat, and fuller translations.
