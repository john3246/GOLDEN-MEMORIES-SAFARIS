import { site, media as GM } from '../home/content.js';

export const contactHero = {
  kicker: 'Get in touch',
  title: 'Plan your Tanzania trip with a local expert',
  cta: 'Send a message',
  image: GM.savanna,
};

export const contactIntro = {
  kicker: 'Get in touch',
  title: 'Contact details',
  body: 'Call, WhatsApp or email our team in Arusha, or use the form. Tell us your travel dates, the number of travellers and what you would like to see, and a consultant will reply personally, usually within one working day.',
};

export function getContactDetails() {
  return [
    {
      label: 'Our Office',
      value: site.address,
      href: '',
    },
    {
      label: 'Call Us',
      value: site.phone,
      href: `tel:${site.phone.replace(/\s+/g, '')}`,
    },
    {
      label: 'Email Us',
      value: site.email,
      href: `mailto:${site.email}`,
    },
    {
      label: 'Availability',
      value: '24/7 by phone and WhatsApp',
      href: '',
    },
  ];
}

export const contactMap = {
  title: 'Visit our office in Njiro, Arusha',
  src: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3982.6747911064217!2d36.702341075784375!3d-3.429116996545406!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x185c49e4ead53d9d%3A0xe1f06df544443923!2sGolden%20Memories%20Safaris!5e0!3m2!1sen!2stz!4v1746522059185!5m2!1sen!2stz',
};

export const contactFormCopy = {
  title: 'Send us a message',
  body: 'The more you tell us, dates, group size, budget, interests, the more useful our first reply will be.',
};
