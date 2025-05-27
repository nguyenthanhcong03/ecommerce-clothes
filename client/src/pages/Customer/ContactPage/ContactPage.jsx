import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import ContactForm from '@/pages/customer/ContactPage/components/ContactForm';
import ContactInfo from '@/pages/customer/ContactPage/components/ContactInfo';
import ContactMap from '@/pages/customer/ContactPage/components/ContactMap';
import React from 'react';

function ContactPage() {
  return (
    <div className='pt-[60px] lg:pt-[80px]'>
      <div className='my-5'>
        <Breadcrumb
          items={[
            {
              label: 'Liên hệ',
              path: '/contact'
            }
          ]}
        />
      </div>
      <div className='mx-auto h-[450px] w-full rounded-sm bg-white p-4'>
        <ContactMap />
      </div>
      <div className='mx-auto mt-6 flex w-full flex-col gap-10 rounded-sm border-[1px] border-[#e1e1e1] bg-white md:flex-row md:gap-0'>
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  );
}

export default ContactPage;
