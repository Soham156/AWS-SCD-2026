import React, { useState } from 'react'

const POSTS = [
  {
    name: 'Abhishek Maurya',
    role: 'Senior Cloud Engineer',
    text: 'One of the most engaging student communities I have worked with. The energy in the room was incredible, and seeing students deploy, break, and recover cloud infrastructure in real time made the session truly memorable.',
  },
  {
    name: 'Diksha Chaudhari',
    role: 'Computer Engineering Student',
    text: 'Before attending this workshop, GitHub Copilot felt like just another AI tool. The hands-on activities helped me understand how to use it effectively for debugging, learning new technologies, and writing cleaner code.',
  },
  {
    name: 'Pratik Gadhe',
    role: 'Student Developer',
    text: 'The best part was that we built real projects instead of just listening to presentations. I left with practical skills, new ideas, and the confidence to use AI tools in my own development workflow.',
  },
  {
    name: 'Chetan Prajapat',
    role: 'Student',
    text: 'The sessions were well-structured, beginner-friendly, and highly interactive. Every concept was demonstrated live, making it much easier to understand and apply afterward.',
  },
  {
    name: 'Kajal Shinde',
    role: 'Student',
    text: 'I discovered several VS Code features and extensions that I had never used before. Small productivity improvements like these can save hours during project development.',
  },
  {
    name: 'Harshvardhini Bhadane',
    role: 'Student',
    text: 'What impressed me most was the practical approach. We were encouraged to experiment, make mistakes, and learn through hands-on exercises rather than simply watching demonstrations.',
  },
  {
    name: 'Gaurav Popli',
    role: 'Student',
    text: 'The event showed how AI can be used responsibly to accelerate development without replacing problem-solving skills. It completely changed my perspective on developer productivity tools.',
  },
  {
    name: 'Rajshri Wagh',
    role: 'Student',
    text: 'A fantastic learning experience from start to finish. The speakers explained complex concepts in a simple way and shared practical tips that I could immediately apply in my academic projects.',
  },
  {
    name: 'Mayur Badgujar',
    role: 'Student Speaker',
    text: 'Having the opportunity to speak in front of hundreds of students was an unforgettable experience. The enthusiasm from the audience made the session highly interactive and rewarding.',
  },
  {
    name: 'Chaitali Jadhav',
    role: 'Student',
    text: 'The workshop helped me understand how modern developers use AI-assisted tools in real-world environments. It was inspiring, informative, and packed with practical takeaways.',
  },
  {
    name: 'Sakshi Patil',
    role: 'Student',
    text: 'I attended out of curiosity but left motivated to build more projects. The live coding demonstrations showed how much faster development can become when the right tools are used effectively.',
  },
  {
    name: 'Rohit Sonawane',
    role: 'Student',
    text: 'The organizers created an excellent learning environment. Every session delivered value, and networking with like-minded students was an added bonus.',
  },
  {
    name: 'Vaishnavi Mahajan',
    role: 'Student',
    text: 'The combination of VS Code tips, GitHub Copilot workflows, and hands-on exercises made this one of the most useful technical workshops I have attended this year.',
  },
  {
    name: 'Akash Bagul',
    role: 'Student Developer',
    text: 'I especially enjoyed the real-world examples and live project building sessions. They helped bridge the gap between theory and practical software development.',
  },
  {
    name: 'Sneha Chavan',
    role: 'Student',
    text: 'The event was packed with actionable insights. I started using several techniques from the workshop the very next day while working on my personal projects.',
  }
];

import { motion } from 'motion/react';
import { MessageSquareQuote } from 'lucide-react';
import { SectionHeader } from './LayoutElements';

export const SocialWall = () => {
  const [showAll, setShowAll] = useState(false);
  return (
    <section className="relative py-16 sm:py-24 px-4 sm:px-12 lg:px-24 bg-[#050505]">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-aws-orange/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="sticky top-0 z-30 bg-gradient-to-b from-[#050505] via-[#050505]/90 to-transparent backdrop-blur-[8px] pt-10 sm:pt-12 lg:pt-16  -mt-10 sm:-mt-12 lg:-mt-16 mb-0">
        <SectionHeader 
          title="Community Wall" 
          subtitle="" 
          sysId="09.SCL" 
        />
      <p className="font-sans text-xs sm:text-sm md:text-base opacity-60 font-medium leading-relaxed max-w-xl pb-2 mb-8 -mt-2 relative z-10">
        Join the conversation and see what the community is building.
      </p>
      </div>

      <div className="w-full mt-12 sm:mt-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {POSTS.slice(0, showAll ? POSTS.length : 3).map((post, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: (idx % 3) * 0.1 }}
              className="group flex"
            >
              <div className="bg-[#0a0a0a] border border-white/5 rounded-none p-6 hover:border-aws-orange/50 hover:bg-[#111] transition-colors duration-300 relative overflow-hidden flex flex-col w-full">
                {/* Accent line on hover */}
                <div className="absolute top-0 left-0 w-full h-[2px] bg-aws-orange transform -translate-x-full group-hover:translate-x-0 transition-transform duration-500 ease-out" />
                
                <div className="flex justify-between items-start mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#111] border border-white/10 flex items-center justify-center text-white font-sans font-black italic text-lg group-hover:border-aws-orange/50 group-hover:text-aws-orange transition-colors shrink-0">
                      {post.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-white font-sans font-black italic tracking-tight group-hover:text-aws-orange transition-colors line-clamp-1">
                        {post.name}
                      </h3>
                      <p className="font-mono text-xs text-white/50 uppercase tracking-widest mt-0.5 line-clamp-1">
                        {post.role}
                      </p>
                    </div>
                  </div>
                  <MessageSquareQuote className="w-5 h-5 text-white/20 group-hover:text-aws-orange/80 transition-colors shrink-0 ml-2" />
                </div>
                <p className="text-white/70 text-sm leading-relaxed font-sans flex-grow">
                  "{post.text}"
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {!showAll && POSTS.length > 4 && (
        <div className="mt-12 flex justify-center relative z-10">
          <button
            onClick={() => setShowAll(true)}
            className="px-6 py-3 border border-white/20 text-white/70 hover:text-white hover:border-white/50 hover:bg-white/5 font-mono text-xs uppercase tracking-widest transition-all duration-300 rounded-sm"
          >
            See More
          </button>
        </div>
      )}
    </section>
  );
};

export default SocialWall;