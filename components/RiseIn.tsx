// Tiêu đề dâng lên từ sau một lớp che — tầng 2 của hệ nhịp thở.
//
// Ba trang trong không có hero ảnh, nên điểm nhấn của chúng là chữ. Bọc heading
// trong một khối overflow:hidden rồi trượt nó lên từ dưới lên; RevealInit gắn
// data-risen khi khối lọt vào tầm nhìn.
//
// Chỉ dùng cho MỘT heading mỗi trang. Hai điểm nhấn trên một trang thì không
// còn điểm nhấn nào.
export default function RiseIn({
  children,
  delay,
}: {
  children: React.ReactNode
  /** Ví dụ '.12s' — cho nhiều dòng lệch nhau. */
  delay?: string
}) {
  return (
    <span className="wabi-rise" data-rise>
      <span style={delay ? { transitionDelay: delay } : undefined}>{children}</span>
    </span>
  )
}
