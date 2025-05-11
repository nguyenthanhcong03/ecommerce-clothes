import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

// Schema dùng yup
const schema = yup
  .object({
    name: yup.string().required('Tên không được để trống'),
    dateOfBirth: yup
      .string()
      .nullable()
      .transform((value, originalValue) => (originalValue === '' ? null : value))
      .matches(/^\d{4}-\d{2}-\d{2}$/, 'Định dạng ngày không hợp lệ (YYYY-MM-DD)')
      .test('is-valid-date', 'Ngày không hợp lệ', (value) => {
        if (!value) return true; // Không bắt buộc
        const date = new Date(value);
        return !isNaN(date.getTime());
      })
  })
  .required();

export default function ProfileForm() {
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(schema)
  });

  const onSubmit = (data) => {
    console.log('Dữ liệu hợp lệ:', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label>Tên:</label>
        <input {...register('name')} />
        {errors.name && <p style={{ color: 'red' }}>{errors.name.message}</p>}
      </div>

      <div>
        <label>Ngày sinh (không bắt buộc):</label>
        <input type='date' {...register('dateOfBirth')} />
        {errors.dateOfBirth && <p style={{ color: 'red' }}>{errors.dateOfBirth.message}</p>}
      </div>

      <button type='submit'>Lưu</button>
    </form>
  );
}
