import ContactForm from '@/pages/customer/ContactPage/components/ContactForm/ContactForm';
import ContactInfo from '@/pages/customer/ContactPage/components/ContactInfo/ContactInfo';
import ContactMap from '@/pages/customer/ContactPage/components/ContactMap/ContactMap';
import React from 'react';

function ContactPage() {
  return (
    <div className='mx-auto w-full max-w-[1280px] px-10 pt-[60px] lg:pt-[80px]'>
      <div className='my-5'></div>
      <div className='mx-auto h-[450px] w-full'>
        <ContactMap />
      </div>
      <div className='mx-auto my-14 flex w-full flex-col gap-10 border-[1px] border-[#e1e1e1] md:flex-row md:gap-0'>
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  );
}

export default ContactPage;
