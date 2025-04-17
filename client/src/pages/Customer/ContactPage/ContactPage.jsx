import React from 'react';
import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import ContactMap from '@/components/ui/contact/ContactMap/ContactMap';
import ContactInfo from '@/components/ui/contact/ContactInfo/ContactInfo';
import ContactForm from '@/components/ui/contact/ContactForm/ContactForm';

function ContactPage() {
  const breadcrumbItems = [
    { label: 'Trang chủ', link: '/' },
    { label: 'Liên hệ' } // Không có link, là trang hiện tại
  ];

  return (
    <div className='mx-auto w-full max-w-[1280px] px-10 pt-[60px] lg:pt-[80px]'>
      <div className='my-5'>
        <Breadcrumb items={breadcrumbItems} />
      </div>
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
