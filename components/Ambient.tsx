// Nền trôi — tầng 1 của hệ nhịp thở.
//
// Nằm ở layout nên có mặt ở cả 4 route mà không trang nào phải nhớ thêm gì.
// Chu kỳ 44s và 55s (4× và 5× nhịp gốc): chậm tới mức không ai thấy nó chuyển
// động, chỉ thấy trang không đứng yên.
//
// position:fixed + z-index:0, và mọi nội dung nằm trên nền này nhờ #wabi có
// position:relative. pointer-events:none để không chắn click.
export default function Ambient() {
  return (
    <div className="wabi-ambient" aria-hidden="true">
      <span className="a1" />
      <span className="a2" />
    </div>
  )
}
