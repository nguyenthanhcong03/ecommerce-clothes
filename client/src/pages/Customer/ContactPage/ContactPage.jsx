import Breadcrumb from '@/components/common/Breadcrumb/Breadcrumb';
import ContactForm from '@/pages/customer/ContactPage/components/ContactForm/ContactForm';
import ContactInfo from '@/pages/customer/ContactPage/components/ContactInfo/ContactInfo';
import ContactMap from '@/pages/customer/ContactPage/components/ContactMap/ContactMap';
import React from 'react';

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
