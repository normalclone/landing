'use client'

import { useEffect } from "react"

const heroHeadingText = "Luyện thi thông minh – đánh giá năng lực chuẩn xác"

type Testimonial = {
  quote: string
  name: string
  detail: string
  avatarUrl: string
}

const testimonials: Testimonial[] = [
  {
    quote:
      "Sau 1 tháng luyện đều, điểm Toán của mình tăng 2.3 điểm nhờ lộ trình ôn tập cá nhân hoá.",
    name: "Khôi",
    detail: "Lớp 12A1 • Hà Nội",
    avatarUrl: "https://i.pravatar.cc/128?img=12",
  },
  {
    quote:
      "Bộ đề luyện thi bám rất sát cấu trúc, mỗi lần luyện xong đều có phân tích chi tiết từng câu.",
    name: "Mai Anh",
    detail: "Lớp 11 • Hà Nội",
    avatarUrl: "https://i.pravatar.cc/128?img=45",
  },
  {
    quote:
      "Nhận ra phần Hóa hữu cơ yếu nên mình tập trung luyện thêm và đã kéo điểm từ 6 lên 8 trong 2 tuần.",
    name: "Minh Quân",
    detail: "Sĩ tử tự do • Đà Nẵng",
    avatarUrl: "https://i.pravatar.cc/128?img=5",
  },
  {
    quote:
      "Giao diện dễ dùng, lịch học gợi ý rõ ràng giúp mình duy trì thói quen luyện tập mỗi ngày.",
    name: "Lan Phương",
    detail: "Lớp 12 • Bắc Ninh",
    avatarUrl: "https://i.pravatar.cc/128?img=21",
  },
  {
    quote:
      "Các dạng câu hỏi tư duy rất hay, sau mỗi bài còn có video giải thích nên hiểu bản chất nhanh hơn.",
    name: "Tuấn Anh",
    detail: "Lớp 12 • TP.HCM",
    avatarUrl: "https://i.pravatar.cc/128?img=16",
  },
  {
    quote:
      "Mình thích nhất bảng xếp hạng, nhìn thấy mình vượt bạn bè mỗi tuần là có thêm động lực học.",
    name: "Như Ý",
    detail: "Lớp 10 • Cần Thơ",
    avatarUrl: "https://i.pravatar.cc/128?img=37",
  },
  {
    quote:
      "Thầy cô phản hồi bài luận trong vòng 24 giờ, góp ý chi tiết từng đoạn nên điểm Văn của mình cải thiện rõ.",
    name: "Phương Nam",
    detail: "Lớp 12 • Hải Phòng",
    avatarUrl: "https://i.pravatar.cc/128?img=28",
  },
  {
    quote:
      "Mỗi chủ đề đều có câu hỏi mức độ từ dễ đến khó, luyện xong là thấy tự tin bước vào phòng thi ngay.",
    name: "Hoàng Yến",
    detail: "Lớp 11 • Nghệ An",
    avatarUrl: "https://i.pravatar.cc/128?img=48",
  },
  {
    quote:
      "Sau khi luyện đề mô phỏng, mình biết chính xác mình thiếu kỹ năng quản lý thời gian và đã khắc phục.",
    name: "Đức Thịnh",
    detail: "Lớp 12 • Bình Dương",
    avatarUrl: "https://i.pravatar.cc/128?img=11",
  },
  {
    quote:
      "Bố mẹ xem được báo cáo tiến độ hằng tuần nên luôn yên tâm và cùng mình điều chỉnh mục tiêu kịp thời.",
    name: "Thảo Nhi",
    detail: "Lớp 9 • Đồng Nai",
    avatarUrl: "https://i.pravatar.cc/128?img=10",
  },
  {
    quote:
      "Các mini test 15 phút giúp mình ôn nhanh trước giờ lên lớp, không còn cảm giác bị quá tải kiến thức.",
    name: "Quang Huy",
    detail: "Lớp 10 • Huế",
    avatarUrl: "https://i.pravatar.cc/128?img=14",
  },
  {
    quote:
      "Bộ phân tích điểm mạnh yếu dạng biểu đồ rất trực quan, chỉ cần nhìn là biết hôm nay nên học phần nào.",
    name: "Kim Ngân",
    detail: "Lớp 12 • Bà Rịa - Vũng Tàu",
    avatarUrl: "https://i.pravatar.cc/128?img=52",
  },
]

export default function HomePage() {

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const animatedElements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-animate]")
    )

    if (animatedElements.length === 0) {
      return
    }

    const prefersReducedMotion =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null

    if (
      (prefersReducedMotion && prefersReducedMotion.matches) ||
      !("IntersectionObserver" in window)
    ) {
      animatedElements.forEach((element) => {
        element.classList.add("is-visible")
      })
      return
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            obs.unobserve(entry.target)
          }
        })
      },
      {
        threshold: 0,
        rootMargin: "0px 0px 8% 0px",
      }
    )

    const revealIfInView = (element: HTMLElement) => {
      const rect = element.getBoundingClientRect()
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight

      if (rect.top <= viewportHeight * 1.05 && rect.bottom >= 0) {
        element.classList.add("is-visible")
        return true
      }

      return false
    }

    animatedElements.forEach((element) => {
      if (
        element.classList.contains("is-visible") ||
        revealIfInView(element)
      ) {
        return
      }

      observer.observe(element)
    })

    return () => {
      observer.disconnect()
    }
  }, [])

  const testimonialsPerSlide = 3
  const testimonialGroups = testimonials.reduce<Testimonial[][]>((groups, testimonial, index) => {
    if (index % testimonialsPerSlide === 0) {
      groups.push([testimonial])
    } else {
      groups[groups.length - 1].push(testimonial)
    }

    return groups
  }, [])

  return (
    <>
      <main className="content-offset">
        <section className="hero-wrap py-5 py-lg-5">
          <div data-animate className="container fade-in-up">
            <div className="hero-grid">
              <div className="hero-content">
                <h1 data-animate className="headline display-5 mb-3 fade-in-up">
                  {heroHeadingText}
                </h1>
                <p data-animate className="subtext lead mb-4 fade-in-up">
                  Beexamine giúp bạn luyện tập theo đề thi thật, chấm điểm tự động và theo dõi tiến bộ qua từng bài thi – hoàn toàn miễn phí, minh bạch, công bằng.
                </p>
                <div
                  data-animate
                  className="d-flex flex-wrap gap-2 mb-4 fade-in-up"
                  aria-label="Điểm nổi bật"
                >
                  <div className="point">
                    <span className="dot honey" />
                    Chấm điểm tức thì
                  </div>
                  <div className="point">
                    <span className="dot indi" />
                    Đề thi thật – cập nhật liên tục
                  </div>
                  <div className="point">
                    <span className="dot bee" />
                    Hệ thống xếp hạng
                  </div>
                </div>
                <div data-animate className="d-flex flex-wrap gap-2 fade-in-up">
                  <a
                    className="btn btn-honey"
                    href="#cta"
                    role="button"
                    aria-label="Bắt đầu luyện thi ngay"
                  >
                    Bắt đầu luyện thi ngay
                  </a>
                  <a
                    className="btn btn-indigo"
                    href="#leaderboard"
                    role="button"
                    aria-label="Xem bảng xếp hạng"
                  >
                    Xem bảng xếp hạng
                  </a>
                </div>
              </div>
              <div data-animate className="hero-leaderboard fade-in-up">
                <aside
                  data-animate
                  className="board p-3 p-md-4 shadow-card h-100 scale-in"
                  aria-labelledby="miniBoardTitle"
                >
                  <div className="d-flex align-items-center justify-content-between mb-1">
                    <h3 className="h4 mb-0" id="miniBoardTitle">
                      🏆 Bảng Ong Vàng
                    </h3>
                    <span className="badge-bee">Top tuần</span>
                  </div>
                  <small className="d-block mb-3 text-slate">
                    Cập nhật theo điểm trung bình cao nhất trong hệ thống.
                  </small>

                  <div className="table-responsive">
                    <table className="table table-mini align-middle">
                      <thead>
                        <tr>
                          <th scope="col" className="td-num">
                            #
                          </th>
                          <th scope="col">Thí sinh</th>
                          <th scope="col" className="td-score">
                            Điểm TB
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="td-num" aria-label="Hạng 1">
                            🥇
                          </td>
                          <td className="fw-semibold">Nguyễn Thảo</td>
                          <td className="td-score">29.3</td>
                        </tr>
                        <tr>
                          <td className="td-num" aria-label="Hạng 2">
                            🥈
                          </td>
                          <td className="fw-semibold">Phạm Minh Quân</td>
                          <td className="td-score">28.9</td>
                        </tr>
                        <tr>
                          <td className="td-num" aria-label="Hạng 3">
                            🥉
                          </td>
                          <td className="fw-semibold">Trần Ngọc Anh</td>
                          <td className="td-score">28.7</td>
                        </tr>
                        <tr>
                          <td className="td-num">4</td>
                          <td>Lê Hoàng Long</td>
                          <td className="td-score">28.5</td>
                        </tr>
                        <tr>
                          <td className="td-num">5</td>
                          <td>Nguyễn Mai Phương</td>
                          <td className="td-score">28.3</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex align-items-center justify-content-between mt-2">
                    <div className="text-secondary small">
                      Cập nhật 5 phút trước • 10.542 người đang luyện thi
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        <section id="about" className="section">
          <div data-animate className="container fade-in-up">
            <div className="row g-4 align-items-center">
              <div data-animate className="col-12 col-lg-6 fade-in-up">
                <h2 className="fw-black display-6">Luyện thi thật – đánh giá thật</h2>
                <p className="text-slate fs-5">
                  Beexamine là nền tảng luyện thi &amp; đánh giá năng lực trực tuyến. Bạn làm bài từ nguồn đề thi thật/cập nhật liên tục, được chấm điểm tức thì và theo dõi tiến bộ rõ ràng. Mục tiêu của chúng tôi: giúp bạn biết mình đang ở đâu – và cần gì để bứt phá.
                </p>
                <ul className="list-unstyled d-grid gap-2 mt-3">
                  <li>
                    <strong>Chấm điểm tức thì</strong>, hiển thị chuẩn chỉnh
                  </li>
                  <li>
                    <strong>Đề thi thật</strong>, liên tục bổ sung
                  </li>
                  <li>
                    <strong>Minh bạch &amp; công bằng</strong>, không “bán khóa”
                  </li>
                </ul>
              </div>
              <div data-animate className="col-12 col-lg-6 fade-in-up">
                <div className="card-surface rounded-xl shadow-card p-4">
                  <div className="row g-3">
                    <div className="col-6">
                      <div className="stat">
                        <div className="num">50.000+</div>
                        <div className="lbl">Người dùng</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="stat">
                        <div className="num">10.000+</div>
                        <div className="lbl">Đề thi</div>
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="stat">
                        <div className="num">2.000.000+</div>
                        <div className="lbl">Lượt làm bài</div>
                      </div>
                    </div>
                    <div className="col-6 d-flex align-items-center">
                      <span className="badge-bee">Cập nhật định kỳ</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="targets" className="section bg-surface border-top border-bottom border-soft">
          <div data-animate className="container fade-in">
            <div data-animate className="d-flex align-items-end justify-content-between mb-3 fade-in-up">
              <div>
                <h2 className="fw-black h1 mb-1">Chọn mục tiêu của bạn</h2>
                <p className="text-slate mb-0">Lộ trình rõ ràng theo từng kỳ thi.</p>
              </div>
            </div>

            <div className="row g-3 g-lg-4">
              <div data-animate className="col-12 col-md-6 col-lg-3 fade-in-up">
                <div className="card-surface card-cta rounded-xl p-4 h-100">
                  <div className="mb-2 icon-large" aria-hidden="true">
                    📘
                  </div>
                  <h3 className="h5 fw-bold">Luyện thi Đại học (THPTQG)</h3>
                  <p className="text-slate mb-3">Mô phỏng cấu trúc đề chính thức, sát thực tế.</p>
                  <a href="#cta" className="btn btn-indigo btn-sm">
                    Vào luyện thi
                  </a>
                </div>
              </div>
              <div data-animate className="col-12 col-md-6 col-lg-3 fade-in-up">
                <div className="card-surface card-cta rounded-xl p-4 h-100">
                  <div className="mb-2 icon-large" aria-hidden="true">
                    🏫
                  </div>
                  <h3 className="h5 fw-bold">Luyện thi Cấp 3 (lớp 10)</h3>
                  <p className="text-slate mb-3">Bộ đề theo tỉnh/thành, giải thích chi tiết.</p>
                  <a href="#cta" className="btn btn-indigo btn-sm">
                    Làm thử ngay
                  </a>
                </div>
              </div>
              <div data-animate className="col-12 col-md-6 col-lg-3 fade-in-up">
                <div className="card-surface card-cta rounded-xl p-4 h-100">
                  <div className="mb-2 icon-large" aria-hidden="true">
                    🏛️
                  </div>
                  <h3 className="h5 fw-bold">Thi công chức</h3>
                  <p className="text-slate mb-3">Trắc nghiệm hành chính, nghiệp vụ sát thực tế.</p>
                  <a href="#cta" className="btn btn-indigo btn-sm">
                    Khởi động
                  </a>
                </div>
              </div>
              <div data-animate className="col-12 col-md-6 col-lg-3 fade-in-up">
                <div className="card-surface card-cta rounded-xl p-4 h-100">
                  <div className="mb-2 icon-large" aria-hidden="true">
                    📜
                  </div>
                  <h3 className="h5 fw-bold">Thi chứng chỉ</h3>
                  <p className="text-slate mb-3">Tin học, ngoại ngữ, nghiệp vụ — chấm tự động.</p>
                  <a href="#cta" className="btn btn-indigo btn-sm">
                    Làm bài mẫu
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="section">
          <div data-animate className="container fade-in">
            <div className="row g-4 align-items-stretch">
              <div data-animate className="col-12 col-lg-4 fade-in-up">
                <div className="card-surface rounded-xl shadow-card p-4 h-100">
                  <div className="mb-2">
                    <span className="dot honey" />
                  </div>
                  <h3 className="h4 fw-bold">Chấm điểm tức thì &amp; phân tích kết quả</h3>
                  <p className="text-slate">
                    Điểm từng phần/câu, tốc độ làm bài, lỗi phổ biến — mọi thứ hiển thị rõ ràng để bạn điều chỉnh chiến lược học.
                  </p>
                </div>
              </div>
              <div data-animate className="col-12 col-lg-4 fade-in-up">
                <div className="card-surface rounded-xl shadow-card p-4 h-100">
                  <div className="mb-2">
                    <span className="dot indi" />
                  </div>
                  <h3 className="h4 fw-bold">Đề thi thật – cập nhật liên tục</h3>
                  <p className="text-slate">
                    Tổng hợp từ đề chính thức &amp; cộng đồng kiểm duyệt, giúp bạn bám đúng dạng và độ khó.
                  </p>
                </div>
              </div>
              <div data-animate className="col-12 col-lg-4 fade-in-up">
                <div className="card-surface rounded-xl shadow-card p-4 h-100">
                  <div className="mb-2">
                    <span className="dot bee" />
                  </div>
                  <h3 className="h4 fw-bold">Bảng xếp hạng tổng minh bạch</h3>
                  <p className="text-slate">
                    Xếp hạng toàn hệ thống dựa trên điểm trung bình cao nhất — công bằng, không can thiệp thủ công.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="progress" className="section bg-surface border-top border-bottom border-soft">
          <div data-animate className="container fade-in">
            <div className="row g-4 align-items-stretch">
              <div data-animate className="col-12 fade-in-up">
                <h2 className="fw-black h1 mb-3">Theo dõi tiến bộ của bạn</h2>
                <p className="text-slate fs-5">
                  Báo cáo cá nhân hoá giúp bạn biết môn yếu, dạng câu hỏi khó, tốc độ làm bài và độ ổn định điểm — từ đó điều chỉnh chiến lược luyện thi.
                </p>
                <ul className="list-unstyled d-grid gap-2 mt-3">
                  <li>📈 Biểu đồ điểm theo tuần/tháng</li>
                  <li>✅ Tỷ lệ đúng theo chủ đề/độ khó</li>
                  <li>🧠 Gợi ý luyện tiếp dựa trên dữ liệu</li>
                </ul>
                <a href="#cta" className="btn btn-honey mt-2">
                  Vào trang của tôi
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="testimonials" className="section">
          <div data-animate className="container fade-in">
            <h2 className="fw-black h1 mb-4">Người học nói gì về Beexamine?</h2>
            <div
              data-animate
              id="tSlider"
              className="carousel slide fade-in-up"
              data-bs-ride="carousel"
              data-bs-interval="20000"
            >
              <div className="carousel-inner">
                {testimonialGroups.map((group, index) => (
                  <div
                    key={`testimonial-group-${index}`}
                    className={`carousel-item${index === 0 ? " active" : ""}`}
                  >
                    <div className="row g-4 justify-content-center">
                      {group.map((testimonial) => (
                        <div className="col-12 col-md-6 col-lg-4" key={testimonial.name}>
                          <div
                            data-animate
                            className="testimonial-card card-surface rounded-xl p-4 h-100 fade-in-up"
                          >
                            <p className="mb-4 fs-5">
                              &ldquo;
                              {testimonial.quote}
                              &rdquo;
                            </p>
                            <div className="d-flex align-items-center gap-3">
                              <div className="testimonial-avatar">
                                <img
                                  src={testimonial.avatarUrl}
                                  alt={`Ảnh đại diện của ${testimonial.name}`}
                                  loading="lazy"
                                />
                              </div>
                              <div>
                                <div className="fw-semibold">{testimonial.name}</div>
                                <div className="text-slate small">{testimonial.detail}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="trust" className="section bg-surface border-top border-bottom border-soft">
          <div data-animate className="container fade-in">
            <div className="row g-4 align-items-center">
              <div data-animate className="col-12 col-lg-6 fade-in-up">
                <h2 className="fw-black h1 mb-2">Cộng đồng luyện thi nghiêm túc</h2>
                <p className="text-slate fs-5 mb-3">
                  Beexamine tập trung vào chất lượng đề, dữ liệu minh bạch và trải nghiệm thi thật để bạn yên tâm luyện tập hằng ngày.
                </p>
                <div className="d-flex flex-wrap gap-2">
                  <span className="badge-bee">Khẳng định uy tín</span>
                  <span className="badge-bee">Minh bạch</span>
                  <span className="badge-bee">Cập nhật liên tục</span>
                </div>
              </div>
              <div data-animate className="col-12 col-lg-6 fade-in-up">
                <div className="row g-3">
                  <div className="col-6">
                    <div className="stat">
                      <div className="num">4.8/5</div>
                      <div className="lbl">Đánh giá cộng đồng</div>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="stat">
                      <div className="num">98%</div>
                      <div className="lbl">Hài lòng trải nghiệm</div>
                    </div>
                  </div>
                  <div className="col-12">
                    <div className="card-surface rounded-xl p-3 text-center">
                      <div className="text-slate small">Logo đối tác / Trường hợp hợp tác</div>
                      <div className="mt-2">[Logo A] [Logo B] [Logo C]</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="cta" className="section">
          <div data-animate className="container text-center fade-in-up">
            <h2 className="fw-black display-6 mb-3">Sẵn sàng chạm đích?</h2>
            <p className="text-slate fs-5 mb-4">
              Luyện thi miễn phí, chấm điểm tức thì, xếp hạng minh bạch.
            </p>
            <a href="#cta" className="btn btn-honey btn-lg">
              Bắt đầu luyện thi ngay
            </a>
          </div>
        </section>
      </main>
    </>
  )
}
