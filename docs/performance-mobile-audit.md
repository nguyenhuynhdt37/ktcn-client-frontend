# Kiểm tra hiệu suất Mobile KTCN — 10/11/2026

Môi trường người dùng kiểm thử: **https://test-ktcn.itup.io.vn/vi**. Chưa triển khai các thay đổi trong báo cáo lên staging hoặc production. Kết quả sau sửa là bản build production chạy local với API/media staging; không được coi đó là điểm số của staging sau triển khai.

## 1. Bằng chứng và nguyên nhân thực tế

### Hydration #418: Cloudflare sửa HTML email

- Chrome sạch, tắt extension, tái hiện #418 trên cả Mobile và Desktop staging.
- HTML staging chứa `a.__cf_email__[data-cfemail]` ở footer thay vì text email từ source. Có script `/cdn-cgi/.../email-decode.min.js` được Cloudflare chèn thêm.
- CDP debugger dừng tại React hydration và ghi nhận text React chờ là ` vienktcn@vinhuni.edu.vn` trong `span` của footer.
- Thử nghiệm đối chứng trên chính response staging: chỉ phục hồi email thành text gốc, giữ nguyên các script/tài nguyên còn lại. Bản đối chứng có #418, bản phục hồi không còn exception.
- Đây là tác động của lớp CDN lên HTML được hydrate. Cảnh báo extension không giải thích hết lỗi đang gặp. Không có bằng chứng về xung đột phiên bản Next/React.

Áp dụng marker `<!--email_off-->…<!--/email_off-->` theo [Cloudflare](https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/). Chuỗi HTML được chèn là hằng số nội bộ, không chứa dữ liệu người dùng. Tham khảo giải thích [React #418](https://react.dev/errors/418).

### Tài nguyên ban đầu

- `logo.svg` **855.393 byte** thực chất là SVG chứa PNG 2048×703 dạng base64; PNG nhúng **641.216 byte**. Wire size baseline staging khoảng **639.639 byte**.
- Logo này còn được preload bởi `src/app/[locale]/loading.tsx` dù khung loading chỉ rộng 56 px. Chỉ đổi logo header/footer vẫn để lại request lớn từ loading state.
- `watercolor_leaves.png` gốc **1.172.081 byte**. Baseline Mobile tải AVIF 384 px khoảng **91.053 byte** và 640 px khoảng **297.065 byte**. `next/image` đã hoạt động, không phải tải PNG gốc trực tiếp.
- Nhiều `sizes` dùng cú pháp không hợp lệ `(max-w-768px)`. Sửa theo breakpoint và chiều rộng thực tế của card, không đổi crop, class layout hoặc chất lượng ảnh 75.
- Favicon **150.466 byte** chứa 7 frame PNG, từ 16 đến 256 px. Thử nén lossless chỉ còn khoảng 149 KB: không đáng đổi asset; giữ nguyên các frame và hình thức.
- API banner hiện có một banner, `mobile_image_object_key = null`. Giữ nguyên artwork và các tỷ lệ 16:9 / 2.39:1 hiện hữu.

### JavaScript, animation và forced reflow

- `HomeHeroWidget` chỉ dùng translation/Link để hiển thị, không có state hoặc effect; bỏ boundary Client Component không cần thiết. `HeroSlider` vẫn là Client Component có tương tác.
- Không tìm thấy consumer `useQuery`, `useMutation`, `useQueryClient`, `fetchQuery` hoặc hydration của React Query trong các route. Provider ở root chỉ khởi tạo context không được dùng. Giữ dependency, file provider và query client; bỏ việc mount provider toàn site.
- Baseline trace ghi nhận Embla đo `offsetWidth/offsetHeight` và forced reflow khoảng **42,7 ms** cho carousel chỉ có một banner. Tắt hoạt động Embla khi chỉ có một banner; trace thử còn khoảng **1,3 ms** ở vị trí đó. Nhiều banner vẫn dùng Embla, điều hướng và autoplay như trước.
- Google Analytics tải khoảng **177 KB** và sử dụng khoảng **0,36–0,42 giây CPU** trong các trace Mobile. Chuyển thư viện sang `lazyOnload`, giữ khởi tạo hàng đợi `dataLayer` sớm. Browser test xác nhận script tải một lần, config còn trong hàng đợi; đã quan sát request `page_view` trả 204. Không khẳng định tổng CPU GA đã giảm.
- Fireworks là nguồn công việc đáng kể: trace gán khoảng **2,4–2,8 giây** tổng CPU cho chunk của thư viện. Thử chặn riêng chunk để chẩn đoán làm giảm main-thread work, nhưng không giải quyết hết LCP. Đây chỉ là phép thử đối chứng, không phải bản tối ưu cuối.
- Thử containment/ResizeObserver riêng cho canvas không có lợi ích ổn định; đã hoàn nguyên. **File Fireworks, số hạt, thời lượng, autoplay và animation lá giữ nguyên.**
- Bỏ MutationObserver toàn document dùng để gỡ `bis_skin_checked`: nó duyệt các subtree trong lúc stream/hydrate nhưng không sửa được nguyên nhân Cloudflare đã xác minh. Không dùng `suppressHydrationWarning` để che lỗi email.
- Không preload JetBrains Mono không được dùng trên trang chủ; font và CSS vẫn có sẵn khi nội dung cần đến.

### SSR, API fetching và loading states

- Next.js **16.2.9**, React/React DOM **19.2.4**, App Router, `reactStrictMode`, output standalone, ảnh AVIF/WebP. Đã đọc tài liệu đi kèm đúng phiên bản trong `node_modules/next/dist/docs/`.
- Trang chủ fetch banner và 7 nhóm bài viết song song; layout fetch menu/header/footer, languages và 100 latest articles song song. Dữ liệu chính được SSR; không có waterfall client fetch để tạo toàn bộ nội dung chính.
- Các nhóm API vẫn được chờ chung trước khi hoàn tất nội dung trang. TTFB staging baseline đo được khoảng 213 ms trong trace đầu, không đủ để kết luận API là nguyên nhân chính của LCP 11 giây.
- Đã thử giới hạn `noStore()` vào maintenance để cho Next prerender/revalidate trang công khai. Build chuyển sang cache 60 giây nhưng LCP Mobile không cải thiện rõ; đã hoàn nguyên để giữ cơ chế cập nhật và maintenance hiện hữu.
- Khi paint nhanh hơn, một race của loading lộ ra: footer được vẽ trong viewport dưới loading cao 60vh, rồi bị đẩy khỏi màn hình khi page tới. Observer đối chứng ghi nhận riêng footer đóng góp CLS khoảng **0,273**; một lần Lighthouse ghi nhận tổng CLS **0,890**.
- Root content có margin collapse khi chuyển từ loading sang hero. Tạo formatting context ổn định bằng `flow-root`; bù anchor lớp lá trang trí 24 px để giữ vị trí hình ảnh khi trang hoàn tất. Loading dành đủ chiều cao màn hình, giữ spinner trong vùng 60vh ban đầu.
- Observer còn ghi nhận HTML menu được parser vẽ khi mới có 2 mục, rồi tăng lên đủ 6 mục. Header/top bar có marker cuối HTML; CSS chỉ paint khi marker đã tới, không chờ hydration và không dùng timer. Browser không hỗ trợ `:has` giữ cách render hiện hữu qua `@supports`.
- Fallback ngôn ngữ dùng cùng trigger/flag/label với nút thật, tránh chuyển từ placeholder rộng 96 px sang nút rộng hơn. Không đổi giao diện nút sau khi tải xong.

## 2. File đã chỉnh sửa

| File | Thay đổi |
|---|---|
| `next.config.ts` | Thêm độ phân giải nhỏ; cache `/images/*`, favicon 1 ngày, stale 7 ngày. Không cache API, HTML hoặc service worker bằng rule này. |
| `src/app/[locale]/layout.tsx` | GA idle, bỏ preload Mono/observer DOM, ổn định formatting context; giữ `noStore()` như cũ. |
| `src/app/[locale]/loading.tsx` | Logo nhỏ; reserve chiều cao khi tải, giữ vị trí spinner. |
| `src/app/[locale]/(public)/page.tsx` | Bù anchor trang trí theo formatting context, giữ tọa độ cuối cùng. |
| `src/app/globals.css` | Guard paint cho các hàng HTML đang stream; có fallback khi browser không hỗ trợ selector. |
| `src/shared/components/layout/header.tsx` | Logo responsive, marker hoàn tất HTML. |
| `src/shared/components/layout/top-bar.tsx` | Placeholder ngôn ngữ cùng kích thước nút thật; marker HTML. |
| `src/features/language/components/LanguageSwitcher.tsx` | Dùng chung markup trigger/flag cho trạng thái pending và trạng thái thật. |
| `src/shared/components/layout/footer/contact-information.tsx` | Marker Cloudflare cho email; logo responsive. |
| `src/shared/components/layout/footer/facebook-fanpage.tsx` | Logo responsive. |
| `src/shared/components/ui/brand-logo.tsx` | Loader chọn bitmap lossless phù hợp DPR; URL có hash của Next. |
| `src/shared/assets/logo-{320,480,640,960,1280,2048}.webp` | Biến thể từ bitmap gốc, giữ alpha và artwork. |
| `public/images/logo.svg` | PNG nhúng → WebP lossless, 855.393 → 648.590 byte; assert toàn bộ alpha và RGB ở pixel nhìn thấy. |
| `src/shared/providers/root-providers.tsx` | Không mount React Query khi không có consumer. |
| `src/features/banner/components/HomeHeroWidget.tsx` | Server Component; chỉnh cấp heading, giữ text/class. |
| `src/features/banner/components/HeroSlider.tsx` | Preload/high priority LCP, sizes đúng; Embla chỉ hoạt động khi cần carousel. |
| `src/features/article/components/NewsGrid.tsx`, `ArticleCard.tsx`, `ArticleDetailContent.tsx` | Sửa `sizes`. |
| `src/features/admission/components/AdmissionSection.tsx` | `sizes` theo grid đang có. |
| `src/features/research/components/ResearchSection.tsx` | `sizes` theo grid đang có. |
| `src/features/student/components/StudentActivities.tsx` | `sizes` theo grid đang có. |
| `scripts/optimize-logo.mjs` | Tái tạo asset và kiểm tra visible pixels của bản đầy đủ. |
| `scripts/performance-audit.mjs` | Chạy Lighthouse lặp lại, kiểm tra formFactor thật, lưu HTML/JSON/trace. |
| `tests/performance.browser.mjs` | Kiểm thử viewport, exception, API, menu, ngôn ngữ, notification, GA, fireworks và form. |
| `.gitignore`, `.dockerignore` | Bỏ qua output benchmark trong Git và Docker build context. |
| Báo cáo này | Bằng chứng, kết quả, giới hạn và lệnh chạy lại. |

Các tài liệu đã có thay đổi trước khi bắt đầu công việc được giữ nguyên. Không chỉnh backend, schema API, routing, metadata/canonical/hreflang/robots, nội dung bài viết hoặc các dependency.

## 3. Phương pháp đo

- Lighthouse **13.0.3**, Chrome headless **157**, profile tạm mới cho từng run, `--disable-extensions`.
- Mobile: 412×823, DPR 1,75; simulated throttling 4× CPU, RTT 150 ms, throughput 1.638,4 Kbps theo preset Lighthouse.
- Desktop: 1350×940, DPR 1, cấu hình Desktop thực tế. Script assert `configSettings.formFactor`, tránh nhầm nhãn Desktop với preset Mobile.
- Build production, API/media staging. Bảng so sánh local trước/sau dùng cùng `next start`; đã smoke test thêm đúng entry `.next/standalone/server.js`: `/vi` và `/en` trả 200, có marker email; search local vẫn lặp redirect trong cả hai mode. Browser cache lạnh; server/image cache được giữ giữa các run. Baseline run đầu có một số biến thể ảnh mới phải tạo; trung vị dùng các lần tiếp theo khi cache đã ấm. Không chạy benchmark dev server.
- So sánh local trước/sau cùng Chrome và URL. Staging được đo riêng, không dùng điểm local thay cho số đo CDN staging sau triển khai.
- Bản cuối không block GA, fireworks, request hoặc animation; các phép ablation chỉ dùng để chẩn đoán.
- Số trung vị của ba lần; giữ cả range/outlier, không chọn lần có điểm cao nhất.

## 4. Kết quả đo

| Thiết bị | Performance | FCP | LCP | TBT | CLS | A11y | SEO |
|---|---:|---:|---:|---:|---:|---:|---:|
| mobile | 55 | 2.17 s | 11.23 s | 640 ms | 0 | 95 | 100 |
| desktop | 86 | 0.75 s | 2.30 s | 26 ms | 0 | 95 | 100 |

Đây là baseline staging sạch. Không thể quy chênh lệch với số người dùng báo (Mobile 35/Desktop 88) cho riêng extension vì chưa có cùng trace, máy và điều kiện mạng.

| Chỉ số, trung vị 3 lần | Mobile trước | Mobile sau | Desktop trước | Desktop sau |
|---|---:|---:|---:|---:|
| Performance | 53 | 66 | 89 | 96 |
| FCP | 3.65 s | 2.13 s | 0.90 s | 0.52 s |
| LCP | 11.20 s | 7.08 s | 2.04 s | 1.33 s |
| TBT | 537 ms | 340 ms | 3 ms | 12 ms |
| Speed Index | 3.72 s | 3.00 s | 1.01 s | 1.09 s |
| Main-thread work | 6.58 s | 6.13 s | 1.59 s | 1.58 s |
| CLS | 0 | 0 | 0 | 0 |
| Transfer | 2201 KiB | 1442 KiB | 2196 KiB | 1403 KiB |
| Accessibility | 95 | 96 | 95 | 96 |
| SEO local | 92 | 92 | 92 | 92 |

**Mobile chưa đạt mục tiêu 90+, LCP dưới 2,5 giây hoặc TBT dưới 200 ms. Desktop đạt mục tiêu 95+ trong ba lần cuối.**

- Mobile sau: Performance **61 / 67 / 66**, LCP **7.24 / 7.08 / 7.08 s**, TBT **494 / 308 / 340 ms**.
- Desktop sau: Performance **96 / 96 / 96**, LCP **1.33 / 1.33 / 1.33 s**.
- **CLS = 0 ở cả 6 lần Lighthouse cuối**; 10 lần đo độc lập có CPU throttling 4× sau sửa loading/streaming cũng có CLS = 0.
- FCP Mobile giảm khoảng **42%**, LCP khoảng **37%**, transfer khoảng **35%** so với baseline local. Đây là số đo của môi trường local nêu trên.
- TBT Mobile trung vị **537 → 340 ms**; range trước/sau còn giao nhau, không bảo đảm mọi phiên truy cập. Main-thread work còn chi phí GA/canvas và cần kiểm tra tiếp trên staging mới.
- Local không đi qua Cloudflare, nên so sánh này chưa định lượng lợi ích bỏ regeneration do #418 trên staging. Phép đối chứng response xác nhận nguyên nhân hydration, không thay thế lần đo staging sau triển khai.
- Các outlier CLS trung gian được giữ lại trong dữ liệu; bảng trên chỉ dùng bản cuối sau khi sửa nguyên nhân.

Nguồn dữ liệu: `D:/KTCN/.performance-audit/`. Staging: `staging-before/mobile-{1,2,3}.json` và `staging-desktop-before/desktop-{1,2,3}.json`. Baseline local: `local-before/`. Bản cuối: **`release-final/`**. Các thư mục `slice-*`, `diagnostic-*`, `isr-experiment`, `final-local`, `approved-final` là thử nghiệm trung gian.

## 5. Kiểm thử và tác động

- Build production Next/Turbopack và TypeScript: **đạt**.
- Test security hiện hữu: **3/3 đạt**.
- Browser test ở **360, 390, 412, 768, 1440 px**: không tràn ngang, **0 page exception**, các public API quan sát trả 200; menu, language switch, notification panel, admission tab, GA, canvas first-visit và validation form rỗng hoạt động.
- Suite browser vẫn **exit 1** vì route search local redirect loop nêu bên dưới; không báo toàn suite xanh. Các route khác được kiểm tra ở page độc lập.
- Đối chiếu trước/sau sửa CLS: tọa độ và kích thước **header/hero chênh 0 px** ở cả 5 viewport. Screenshot lưu trong `release-browser/`; số liệu trong `geometry-comparison.json`.
- JavaScript bị tắt: header vẫn hiện và đủ 6 mục menu; guard streaming không phụ thuộc JS.
- Cache headers thực tế: SVG/favicon 86.400 giây + stale 604.800 giây; logo có hash 31.536.000 giây immutable; HTML vẫn private/no-store; service worker max-age=0.
- Không block script/animation trong cả 6 lần cuối; tất cả runWarnings rỗng.

- Caching chỉ giúp lượt truy cập lại; không gán lợi ích warm browser cache cho điểm Lighthouse cold profile.
- SVG đầy đủ giữ nguyên visible pixels, kiểm tra bằng script. Ảnh responsive giữ cùng artwork/crop; chỉ thay độ phân giải tải phù hợp.
- Fixture 3 banner ở proxy test local: Next, Previous, chọn dot trên Mobile và autoplay đều đạt; 0 exception. Dữ liệu staging thật không bị sửa.
- CSS, nội dung, tỷ lệ banner và các component có tương tác được đối chiếu qua viewport/screenshot. Kiểm tra riêng tọa độ sau sửa CLS.
- Không có consumer React Query trong toàn source. Không xóa dependency hoặc file query provider/client.
- Toàn bộ lint trước sửa: **106 errors / 45 warnings** (chạy ESLint trên nội dung `git show HEAD` cùng cấu hình). Sau sửa: **103 errors / 44 warnings**. Không thêm suppression hoặc skip để đổi kết quả.

## 6. Giới hạn và vấn đề chưa thể xác minh

- Chưa đối chiếu dashboard GA hoặc tracking của phiên thoát rất sớm sau khi chuyển lịch tải script.
- Chưa deploy staging; marker Cloudflare cần được xác nhận qua CDN sau triển khai bằng HTML response, console và Lighthouse lặp lại. Staging hiện vẫn là bản cũ có #418.
- SEO staging baseline **100**. Local báo **92** vì canonical staging khác origin localhost/hreflang do proxy local tạo; không sửa metadata để nâng điểm local. Chưa có điểm SEO staging của bản mới.
- Accessibility baseline 95; phần heading đã sửa. Lỗi màu footer `text-white/60` có contrast **4,02:1**, dưới **4,5:1**. Giữ nguyên màu theo ràng buộc giao diện, không tuyên bố đạt 100.
- API staging không cho CORS từ localhost: Lighthouse local ghi nhận lỗi requests notification/statistics. Browser functional test forward **GET công khai thật** và bổ sung CORS trong test harness để kiểm tra chức năng; không sửa CORS trên backend, không mock dữ liệu và không dùng proxy này để chấm Performance.
- Functional test tìm thấy `/vi/tim-kiem` redirect 301 về chính nó ở local; cùng URL staging trả 200. `proxy.ts`/routing không thay đổi trong patch. Các route giới thiệu, đào tạo và form tư vấn kiểm tra độc lập để tránh lỗi navigation dây chuyền.
- Một lượt test thời tiết gặp DNS `ERR_NAME_NOT_RESOLVED` từ Open-Meteo; fallback sẵn có chạy. Đây không phải exception hydration. Có lúc tải media mới từ Cloudflare gặp timeout khi tạo biến thể lạnh; chưa có bằng chứng lỗi nguồn ảnh.
- Local dùng Node 24/Windows; Dockerfile deployment dùng Node 22-alpine. Chưa kiểm tra phiên bản Node của container đang chạy. Chưa đo bản build mới trên chính container/CDN staging, thiết bị Mobile vật lý hoặc dữ liệu field p75/INP/CrUX.

## Chạy lại

Tooling audit được cài tách khỏi dependency của ứng dụng:

```powershell
npm install --prefix D:/KTCN/.performance-tools --no-audit --no-fund lighthouse@13.0.3 playwright@1.58.2
$env:PERF_TOOLS_DIR = 'D:/KTCN/.performance-tools'
$env:PERF_ARTIFACTS_DIR = 'D:/KTCN/.performance-audit'
$env:CHROME_PATH = 'C:/Program Files/Google/Chrome/Application/chrome.exe'

# Chạy trong ktcn-client-frontend; server production đang chạy ở port 3100.
node scripts/performance-audit.mjs http://localhost:3100/vi repeat-local 3
node tests/performance.browser.mjs http://localhost:3100 repeat-browser

# Sau khi triển khai staging, đo đúng URL staging với cùng công cụ.
node scripts/performance-audit.mjs https://test-ktcn.itup.io.vn/vi staging-after 3

node scripts/optimize-logo.mjs
node --test tests/security.test.mjs
node node_modules/typescript/bin/tsc --noEmit
```

Tài liệu phương pháp: [Lighthouse CLI](https://github.com/GoogleChrome/lighthouse/blob/main/readme.md), [React hydration](https://react.dev/errors/418), [Cloudflare email exclusions](https://developers.cloudflare.com/waf/tools/scrape-shield/email-address-obfuscation/). Các quyết định Next.js đối chiếu tài liệu cài kèm phiên bản 16.2.9.
