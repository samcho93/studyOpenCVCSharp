/* 08차시 필터링: 블러 · 샤프닝 · 잡음 제거 */
(function () {
  const ARROW = (id) => `<defs><marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M0,0 L10,5 L0,10 z" class="fill-arrow"/></marker></defs>`;

  // 그림 1: 커널이 이미지 위를 미끄러진다 (컨볼루션)
  const FIG_CONV = `<svg viewBox="0 0 760 330" role="img" aria-label="3x3 커널이 입력 이미지 위를 한 칸씩 미끄러지며 출력 픽셀 하나를 만드는 컨볼루션 과정">
  ${ARROW('c08a1')}
  <text x="95" y="24" text-anchor="middle" class="tx-b">입력 이미지</text>
  <g>
    <rect x="20" y="36" width="210" height="210" rx="4" class="p1s"/>
    <line x1="20" y1="66" x2="230" y2="66" class="ln"/><line x1="20" y1="96" x2="230" y2="96" class="ln"/><line x1="20" y1="126" x2="230" y2="126" class="ln"/>
    <line x1="20" y1="156" x2="230" y2="156" class="ln"/><line x1="20" y1="186" x2="230" y2="186" class="ln"/><line x1="20" y1="216" x2="230" y2="216" class="ln"/>
    <line x1="50" y1="36" x2="50" y2="246" class="ln"/><line x1="80" y1="36" x2="80" y2="246" class="ln"/><line x1="110" y1="36" x2="110" y2="246" class="ln"/>
    <line x1="140" y1="36" x2="140" y2="246" class="ln"/><line x1="170" y1="36" x2="170" y2="246" class="ln"/><line x1="200" y1="36" x2="200" y2="246" class="ln"/>
  </g>
  <rect x="80" y="96" width="90" height="90" rx="3" class="p3s"/>
  <rect x="80" y="96" width="90" height="90" rx="3" class="s3" fill="none" stroke-width="3"/>
  <text x="95" y="120" text-anchor="middle" class="tx-m">60</text><text x="125" y="120" text-anchor="middle" class="tx-m">62</text><text x="155" y="120" text-anchor="middle" class="tx-m">70</text>
  <text x="95" y="150" text-anchor="middle" class="tx-m">61</text><text x="125" y="150" text-anchor="middle" class="tx-b">90</text><text x="155" y="150" text-anchor="middle" class="tx-m">72</text>
  <text x="95" y="180" text-anchor="middle" class="tx-m">59</text><text x="125" y="180" text-anchor="middle" class="tx-m">63</text><text x="155" y="180" text-anchor="middle" class="tx-m">71</text>
  <text x="125" y="272" text-anchor="middle" class="tx-m">3×3 이웃 (앵커 = 가운데)</text>
  <text x="125" y="292" text-anchor="middle" class="tx-m">→ 오른쪽으로 한 칸, 끝나면 아래 줄로</text>
  <text x="380" y="24" text-anchor="middle" class="tx-b">커널 (3×3 평균)</text>
  <rect x="320" y="96" width="120" height="90" rx="4" class="p2s"/>
  <line x1="320" y1="126" x2="440" y2="126" class="ln"/><line x1="320" y1="156" x2="440" y2="156" class="ln"/>
  <line x1="360" y1="96" x2="360" y2="186" class="ln"/><line x1="400" y1="96" x2="400" y2="186" class="ln"/>
  <text x="340" y="120" text-anchor="middle" class="tx-m">1/9</text><text x="380" y="120" text-anchor="middle" class="tx-m">1/9</text><text x="420" y="120" text-anchor="middle" class="tx-m">1/9</text>
  <text x="340" y="150" text-anchor="middle" class="tx-m">1/9</text><text x="380" y="150" text-anchor="middle" class="tx-m">1/9</text><text x="420" y="150" text-anchor="middle" class="tx-m">1/9</text>
  <text x="340" y="180" text-anchor="middle" class="tx-m">1/9</text><text x="380" y="180" text-anchor="middle" class="tx-m">1/9</text><text x="420" y="180" text-anchor="middle" class="tx-m">1/9</text>
  <text x="380" y="212" text-anchor="middle" class="tx-m">가중치 합 = 1</text>
  <text x="270" y="146" text-anchor="middle" class="tx-b">⊛</text>
  <line x1="450" y1="140" x2="520" y2="140" class="ln" stroke-width="2" marker-end="url(#c08a1)"/>
  <text x="485" y="128" text-anchor="middle" class="tx-m">곱해서 더함</text>
  <text x="640" y="24" text-anchor="middle" class="tx-b">출력 이미지</text>
  <g>
    <rect x="535" y="36" width="210" height="210" rx="4" class="p4s"/>
    <line x1="535" y1="66" x2="745" y2="66" class="ln"/><line x1="535" y1="96" x2="745" y2="96" class="ln"/><line x1="535" y1="126" x2="745" y2="126" class="ln"/>
    <line x1="535" y1="156" x2="745" y2="156" class="ln"/><line x1="535" y1="186" x2="745" y2="186" class="ln"/><line x1="535" y1="216" x2="745" y2="216" class="ln"/>
    <line x1="565" y1="36" x2="565" y2="246" class="ln"/><line x1="595" y1="36" x2="595" y2="246" class="ln"/><line x1="625" y1="36" x2="625" y2="246" class="ln"/>
    <line x1="655" y1="36" x2="655" y2="246" class="ln"/><line x1="685" y1="36" x2="685" y2="246" class="ln"/><line x1="715" y1="36" x2="715" y2="246" class="ln"/>
  </g>
  <rect x="595" y="126" width="30" height="30" class="p5"/>
  <text x="640" y="150" class="tx-b">= 67</text>
  <text x="640" y="272" text-anchor="middle" class="tx-m">(60+62+70+61+90+72+59+63+71) / 9 = 67.6 → 68</text>
  <text x="640" y="292" text-anchor="middle" class="tx-m">가운데 값 90 이 주변에 묻혀 사라진다 = 블러</text>
</svg>`;

  // 그림 2: 평균 커널 vs 가우시안 커널 가중치
  const FIG_KERNEL2 = `<svg viewBox="0 0 700 250" role="img" aria-label="평균 커널은 모든 이웃을 똑같이, 가우시안 커널은 가운데에 큰 가중치를 준다">
  <text x="130" y="26" text-anchor="middle" class="tx-b">평균(Box) 커널 5×5</text>
  <g>
    <rect x="40" y="40" width="180" height="90" rx="4" class="p2s"/>
    <text x="130" y="72" text-anchor="middle" class="tx-m">모든 칸 = 1/25</text>
    <text x="130" y="100" text-anchor="middle" class="tx-m">멀리 있는 픽셀도 똑같이 반영</text>
  </g>
  <rect x="40" y="150" width="180" height="60" rx="4" class="p2s"/>
  <rect x="40" y="150" width="180" height="60" class="s2" fill="none" stroke-width="2"/>
  <text x="130" y="186" text-anchor="middle" class="tx-m">가중치 단면 = 평평한 사각</text>
  <text x="130" y="232" text-anchor="middle" class="tx-m">빠르지만 링잉 · 네모난 번짐</text>
  <text x="470" y="26" text-anchor="middle" class="tx-b">가우시안 커널 5×5 (σ=1)</text>
  <g>
    <rect x="380" y="40" width="180" height="90" rx="4" class="p3s"/>
    <text x="470" y="66" text-anchor="middle" class="tx-m">1  4  6  4  1</text>
    <text x="470" y="88" text-anchor="middle" class="tx-m">4 16 24 16  4</text>
    <text x="470" y="110" text-anchor="middle" class="tx-m">6 24 <tspan class="tx-b">36</tspan> 24  6  (÷256)</text>
  </g>
  <path d="M380,210 C410,210 425,205 440,185 C455,160 460,152 470,152 C480,152 485,160 500,185 C515,205 530,210 560,210" class="s3" fill="none" stroke-width="2"/>
  <line x1="380" y1="210" x2="560" y2="210" class="ax"/>
  <text x="470" y="232" text-anchor="middle" class="tx-m">종 모양 → 부드럽고 자연스러운 번짐</text>
  <text x="300" y="120" text-anchor="middle" class="tx-b">vs</text>
</svg>`;

  // 그림 3: 경계 처리 (BorderTypes)
  const FIG_BORDER = `<svg viewBox="0 0 700 220" role="img" aria-label="이미지 경계 밖의 값을 만드는 네 가지 방법">
  <text x="350" y="22" text-anchor="middle" class="tx-b">원본 한 줄: 10 20 30 40 50 — 왼쪽 2칸을 어떻게 채울까?</text>
  <g>
    <text x="30" y="60" class="tx">Constant</text>
    <rect x="150" y="44" width="60" height="26" class="p5s"/><text x="180" y="62" text-anchor="middle" class="tx-m">0  0</text>
    <rect x="210" y="44" width="150" height="26" class="p1s"/><text x="285" y="62" text-anchor="middle" class="tx-m">10 20 30 40 50</text>
    <text x="400" y="62" class="tx-m">밖은 0 (검정)으로 채움</text>
  </g>
  <g>
    <text x="30" y="98" class="tx">Replicate</text>
    <rect x="150" y="82" width="60" height="26" class="p5s"/><text x="180" y="100" text-anchor="middle" class="tx-m">10 10</text>
    <rect x="210" y="82" width="150" height="26" class="p1s"/><text x="285" y="100" text-anchor="middle" class="tx-m">10 20 30 40 50</text>
    <text x="400" y="100" class="tx-m">맨 끝 값을 그대로 늘림</text>
  </g>
  <g>
    <text x="30" y="136" class="tx">Reflect</text>
    <rect x="150" y="120" width="60" height="26" class="p5s"/><text x="180" y="138" text-anchor="middle" class="tx-m">20 10</text>
    <rect x="210" y="120" width="150" height="26" class="p1s"/><text x="285" y="138" text-anchor="middle" class="tx-m">10 20 30 40 50</text>
    <text x="400" y="138" class="tx-m">거울 (맨 끝 값도 반복)</text>
  </g>
  <g>
    <text x="30" y="174" class="tx">Reflect101</text>
    <rect x="150" y="158" width="60" height="26" class="p3s"/><text x="180" y="176" text-anchor="middle" class="tx-m">30 20</text>
    <rect x="210" y="158" width="150" height="26" class="p1s"/><text x="285" y="176" text-anchor="middle" class="tx-m">10 20 30 40 50</text>
    <text x="400" y="176" class="tx-b">기본값 (Default) — 맨 끝 값은 빼고 거울</text>
  </g>
  <text x="350" y="208" text-anchor="middle" class="tx-m">필터는 이미지 밖의 픽셀이 필요하므로 규칙을 정해야 한다 (BorderTypes)</text>
</svg>`;

  // 그림 4: 가우시안 잡음 vs 소금-후추(임펄스) 잡음
  const FIG_NOISE = `<svg viewBox="0 0 700 280" role="img" aria-label="가우시안 잡음은 모든 픽셀이 조금씩 흔들리고 임펄스 잡음은 일부 픽셀만 0 또는 255 로 튄다">
  <text x="175" y="24" text-anchor="middle" class="tx-b">가우시안 잡음 (센서 잡음)</text>
  <line x1="40" y1="150" x2="320" y2="150" class="ax"/>
  <path d="M40,110 L60,116 L80,104 L100,113 L120,106 L140,115 L160,108 L180,112 L200,104 L220,114 L240,107 L260,111 L280,105 L300,113 L320,108" class="s1" fill="none" stroke-width="2"/>
  <line x1="40" y1="110" x2="320" y2="110" class="ln" stroke-dasharray="4 3"/>
  <text x="332" y="114" class="tx-m">참값</text>
  <text x="175" y="176" text-anchor="middle" class="tx-m">모든 픽셀이 참값 주변에서 ±σ 만큼 흔들린다</text>
  <text x="175" y="200" text-anchor="middle" class="tx-m">평균을 내면 상쇄된다 → <tspan class="tx-b">Gaussian · Blur</tspan> 가 효과적</text>
  <text x="175" y="228" text-anchor="middle" class="tx-m">gradient_noise.png (σ=15)</text>
  <line x1="350" y1="30" x2="350" y2="250" class="ln" stroke-dasharray="4 4"/>
  <text x="525" y="24" text-anchor="middle" class="tx-b">임펄스(소금-후추) 잡음</text>
  <line x1="390" y1="150" x2="670" y2="150" class="ax"/>
  <path d="M390,110 L410,110 L430,110 L450,110 L470,110 L490,110 L510,110 L530,110 L550,110 L570,110 L590,110 L610,110 L630,110 L650,110 L670,110" class="s1" fill="none" stroke-width="2"/>
  <line x1="450" y1="110" x2="450" y2="46" class="s5" stroke-width="3"/><circle cx="450" cy="46" r="4" class="p5"/>
  <line x1="530" y1="110" x2="530" y2="148" class="s5" stroke-width="3"/><circle cx="530" cy="148" r="4" class="p5"/>
  <line x1="610" y1="110" x2="610" y2="46" class="s5" stroke-width="3"/><circle cx="610" cy="46" r="4" class="p5"/>
  <text x="462" y="42" class="tx-m">255 (소금)</text>
  <text x="542" y="164" class="tx-m">0 (후추)</text>
  <text x="525" y="176" text-anchor="middle" class="tx-m">대부분은 정확하고 일부만 끝값으로 튄다</text>
  <text x="525" y="200" text-anchor="middle" class="tx-m">평균은 튄 값에 끌려간다 → <tspan class="tx-b">MedianBlur</tspan> 가 정답</text>
  <text x="525" y="228" text-anchor="middle" class="tx-m">salt_pepper.png (소금 4% + 후추 4%)</text>
</svg>`;

  // 그림 5: 중간값 필터는 정렬해서 가운데를 고른다
  const FIG_MEDIAN = `<svg viewBox="0 0 720 250" role="img" aria-label="3x3 이웃의 값을 정렬해 가운데 값을 고르는 중간값 필터와 평균 필터의 비교">
  <text x="90" y="24" text-anchor="middle" class="tx-b">3×3 이웃</text>
  <rect x="30" y="36" width="120" height="90" rx="4" class="p1s"/>
  <line x1="30" y1="66" x2="150" y2="66" class="ln"/><line x1="30" y1="96" x2="150" y2="96" class="ln"/>
  <line x1="70" y1="36" x2="70" y2="126" class="ln"/><line x1="110" y1="36" x2="110" y2="126" class="ln"/>
  <text x="50" y="60" text-anchor="middle" class="tx-m">62</text><text x="90" y="60" text-anchor="middle" class="tx-m">61</text><text x="130" y="60" text-anchor="middle" class="tx-m">63</text>
  <text x="50" y="90" text-anchor="middle" class="tx-m">60</text><text x="90" y="90" text-anchor="middle" class="tx-b">255</text><text x="130" y="90" text-anchor="middle" class="tx-m">64</text>
  <text x="50" y="120" text-anchor="middle" class="tx-m">59</text><text x="90" y="120" text-anchor="middle" class="tx-m">62</text><text x="130" y="120" text-anchor="middle" class="tx-m">61</text>
  <text x="90" y="148" text-anchor="middle" class="tx-m">가운데가 소금 잡음</text>
  <text x="380" y="24" text-anchor="middle" class="tx-b">9개를 크기 순으로 정렬</text>
  <rect x="200" y="46" width="360" height="30" rx="4" class="p3s"/>
  <text x="380" y="66" text-anchor="middle" class="tx">59 60 61 61 <tspan class="tx-b">62</tspan> 62 63 64 255</text>
  <line x1="380" y1="80" x2="380" y2="104" class="ln" stroke-width="2"/>
  <text x="380" y="122" text-anchor="middle" class="tx-b">5번째 = 중간값 62 → 잡음 완전히 사라짐</text>
  <rect x="200" y="140" width="360" height="30" rx="4" class="p5s"/>
  <text x="380" y="160" text-anchor="middle" class="tx">평균 = (59+…+255)/9 = <tspan class="tx-b">83</tspan> → 잡음이 번져 남음</text>
  <text x="380" y="196" text-anchor="middle" class="tx-m">중간값은 튄 값 하나에 끌려가지 않는다 (비선형 필터)</text>
  <text x="380" y="220" text-anchor="middle" class="tx-m">단, 커널이 크면 가는 선 · 작은 점이 지워질 수 있다</text>
  <text x="640" y="66" text-anchor="middle" class="tx-m">Median</text>
  <text x="640" y="160" text-anchor="middle" class="tx-m">Blur</text>
</svg>`;

  // 그림 6: 양방향 필터 (에지 보존)
  const FIG_BILATERAL = `<svg viewBox="0 0 700 250" role="img" aria-label="가우시안 필터는 에지를 흐리게 만들고 양방향 필터는 밝기 차가 큰 이웃을 무시해 에지를 남긴다">
  <text x="350" y="22" text-anchor="middle" class="tx-b">밝은 면과 어두운 면이 만나는 에지에서</text>
  <text x="115" y="50" text-anchor="middle" class="tx">원본</text>
  <path d="M40,120 L110,120 L110,70 L190,70" class="s1" fill="none" stroke-width="3"/>
  <line x1="40" y1="130" x2="190" y2="130" class="ax"/>
  <text x="115" y="152" text-anchor="middle" class="tx-m">계단처럼 뚝 바뀜</text>
  <text x="115" y="176" text-anchor="middle" class="tx-m">여기에 잡음이 조금 섞여 있다</text>
  <text x="350" y="50" text-anchor="middle" class="tx">GaussianBlur</text>
  <path d="M275,120 C305,120 320,118 345,95 C370,72 395,70 425,70" class="s5" fill="none" stroke-width="3"/>
  <line x1="275" y1="130" x2="425" y2="130" class="ax"/>
  <text x="350" y="152" text-anchor="middle" class="tx-m">잡음도 줄지만 에지도 뭉개짐</text>
  <text x="350" y="176" text-anchor="middle" class="tx-m">거리만 보고 섞기 때문</text>
  <text x="585" y="50" text-anchor="middle" class="tx">BilateralFilter</text>
  <path d="M510,120 L578,120 L578,70 L660,70" class="s3" fill="none" stroke-width="3"/>
  <line x1="510" y1="130" x2="660" y2="130" class="ax"/>
  <text x="585" y="152" text-anchor="middle" class="tx-m">에지는 그대로, 면만 매끈해짐</text>
  <text x="585" y="176" text-anchor="middle" class="tx-m">거리 + <tspan class="tx-b">밝기 차</tspan> 를 함께 본다</text>
  <text x="350" y="212" text-anchor="middle" class="tx-m">가중치 = (거리 가우시안 σ<tspan dy="3">Space</tspan><tspan dy="-3"></tspan>) × (밝기 차 가우시안 σ<tspan dy="3">Color</tspan><tspan dy="-3"></tspan>)</text>
  <text x="350" y="236" text-anchor="middle" class="tx-m">밝기가 많이 다른 이웃은 가중치가 0 에 가까워져 섞이지 않는다 — 대신 느리다</text>
</svg>`;

  // 그림 7: 언샤프 마스크
  const FIG_UNSHARP = `<svg viewBox="0 0 740 200" role="img" aria-label="원본에서 블러를 빼서 얻은 세부를 원본에 더하는 언샤프 마스크">
  ${ARROW('c08a2')}
  <rect x="20" y="60" width="120" height="60" rx="8" class="p1s"/><text x="80" y="86" text-anchor="middle" class="tx-b">원본</text><text x="80" y="106" text-anchor="middle" class="tx-m">src</text>
  <rect x="200" y="20" width="130" height="60" rx="8" class="p2s"/><text x="265" y="46" text-anchor="middle" class="tx">GaussianBlur</text><text x="265" y="66" text-anchor="middle" class="tx-m">blur (저주파)</text>
  <rect x="200" y="110" width="130" height="60" rx="8" class="p3s"/><text x="265" y="136" text-anchor="middle" class="tx">src − blur</text><text x="265" y="156" text-anchor="middle" class="tx-m">세부 · 에지 (고주파)</text>
  <line x1="142" y1="80" x2="196" y2="55" class="ln" stroke-width="2" marker-end="url(#c08a2)"/>
  <line x1="142" y1="100" x2="196" y2="135" class="ln" stroke-width="2" marker-end="url(#c08a2)"/>
  <rect x="400" y="60" width="180" height="60" rx="8" class="p4s"/><text x="490" y="86" text-anchor="middle" class="tx-b">src + k × 세부</text><text x="490" y="106" text-anchor="middle" class="tx-m">AddWeighted(src, 1+k, blur, −k, 0)</text>
  <line x1="334" y1="50" x2="396" y2="78" class="ln" stroke-width="2" marker-end="url(#c08a2)"/>
  <line x1="334" y1="140" x2="396" y2="102" class="ln" stroke-width="2" marker-end="url(#c08a2)"/>
  <rect x="620" y="60" width="100" height="60" rx="8" class="p5s"/><text x="670" y="86" text-anchor="middle" class="tx-b">선명해진</text><text x="670" y="106" text-anchor="middle" class="tx-b">결과</text>
  <line x1="584" y1="90" x2="616" y2="90" class="ln" stroke-width="2" marker-end="url(#c08a2)"/>
  <text x="370" y="190" text-anchor="middle" class="tx-m">k 가 크면 선명하지만 에지에 하얀 테두리(오버슈트)와 잡음까지 강조된다 — 보통 k = 0.5 ~ 1.5</text>
</svg>`;

  // ------------------------------------------------------------------ 1교시 예제
  const EX_CONV = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
        // 원의 왼쪽 에지를 가로지르는 5x5 만 복사해(Clone) 손으로 컨볼루션해 봅니다
        using var roi = img.Clone(new Rect(96, 148, 5, 5));
        Console.WriteLine("원본 5x5 ROI:");
        Console.WriteLine(roi.Dump());

        int sum = 0;
        for (int dy = -1; dy <= 1; dy++)
            for (int dx = -1; dx <= 1; dx++)
                sum += roi.At<byte>(2 + dy, 2 + dx);   // (행, 열) 순서
        Console.WriteLine($"가운데 3x3 합 = {sum}, 평균 = {sum / 9.0:F2}");

        using var blurred = new Mat();
        Cv2.Blur(roi, blurred, new Size(3, 3));
        Console.WriteLine($"Cv2.Blur 의 가운데 값 = {blurred.At<byte>(2, 2)}");
        Console.WriteLine("Blur 결과 5x5:");
        Console.WriteLine(blurred.Dump());
    }
}`;

  const EX_BLUR = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
        using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
        Console.WriteLine($"필터 없음         PSNR = {Cv2.PSNR(clean, noisy):F2} dB");

        using var box = new Mat();
        Cv2.Blur(noisy, box, new Size(3, 3));                       // = BoxFilter + normalize
        Console.WriteLine($"Blur(3x3)         PSNR = {Cv2.PSNR(clean, box):F2} dB");

        using var box2 = new Mat();
        Cv2.BoxFilter(noisy, box2, MatType.CV_8UC1, new Size(3, 3));
        Console.WriteLine($"BoxFilter(3x3)    PSNR = {Cv2.PSNR(clean, box2):F2} dB  (Blur 와 같다)");

        using var gau = new Mat();
        Cv2.GaussianBlur(noisy, gau, new Size(3, 3), 0);            // sigma 0 → ksize 로 자동 계산
        Console.WriteLine($"GaussianBlur(3x3) PSNR = {Cv2.PSNR(clean, gau):F2} dB");

        using var gau5 = new Mat();
        Cv2.GaussianBlur(noisy, gau5, new Size(5, 5), 1.5);
        Console.WriteLine($"GaussianBlur(5x5, sigma 1.5) PSNR = {Cv2.PSNR(clean, gau5):F2} dB");

        Cv2.ImShow("noisy", noisy);
        Cv2.ImShow("gaussian 5x5", gau5);
        Cv2.WaitKey(0);
    }
}`;

  const EX_KSIZE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
        using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
        int[] sizes = new int[] { 3, 9, 21 };

        foreach (int k in sizes)
        {
            using var dst = new Mat();
            Cv2.GaussianBlur(noisy, dst, new Size(k, k), 0);
            Cv2.MeanStdDev(dst, out Scalar m, out Scalar sd);
            Console.WriteLine($"ksize {k,2}x{k,-2} PSNR {Cv2.PSNR(clean, dst):F2} dB, 표준편차 {sd.Val0:F2}");
            Cv2.ImShow("gaussian " + k, dst);
        }
        Cv2.WaitKey(0);
    }
}`;

  const EX_FILTER2D = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);

        // 샤프닝 커널: 가운데를 5배로 키우고 상하좌우를 빼서 차이를 강조 (합 = 1)
        using var sharpK = new Mat(3, 3, MatType.CV_32FC1,
            new float[] { 0, -1, 0, -1, 5, -1, 0, -1, 0 });
        Console.WriteLine("샤프닝 커널:");
        Console.WriteLine(sharpK.Dump());

        using var sharp = new Mat();
        Cv2.Filter2D(img, sharp, MatType.CV_8UC3, sharpK);

        // 엠보싱 커널: 대각선 방향 차이만 남긴다 (합 = 0 → delta 128 을 더해 회색 기준)
        using var embossK = new Mat(3, 3, MatType.CV_32FC1,
            new float[] { -2, -1, 0, -1, 0, 1, 0, 1, 2 });
        using var emboss = new Mat();
        Cv2.Filter2D(img, emboss, MatType.CV_8UC3, embossK, new Point(-1, -1), 128);

        Console.WriteLine($"원본 평균   B{Cv2.Mean(img).Val0:F1}");
        Console.WriteLine($"샤프닝 평균 B{Cv2.Mean(sharp).Val0:F1}  (커널 합이 1 이라 밝기는 거의 그대로)");
        Console.WriteLine($"엠보싱 평균 B{Cv2.Mean(emboss).Val0:F1}  (합이 0 + delta 128 → 회색 주변)");
        Cv2.ImShow("original", img);
        Cv2.ImShow("sharpen", sharp);
        Cv2.ImShow("emboss", emboss);
        Cv2.WaitKey(0);
    }
}`;

  const EX_BORDER = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        // 한 줄짜리 이미지로 경계 처리 규칙을 눈으로 확인합니다
        using var src = new Mat(1, 5, MatType.CV_8UC1, new byte[] { 10, 20, 30, 40, 50 });
        string[] names = new string[] { "Constant  ", "Replicate ", "Reflect   ", "Reflect101" };
        BorderTypes[] types = new BorderTypes[] {
            BorderTypes.Constant, BorderTypes.Replicate, BorderTypes.Reflect, BorderTypes.Reflect101 };

        for (int i = 0; i < names.Length; i++)
        {
            using var padded = new Mat();
            Cv2.CopyMakeBorder(src, padded, 0, 0, 2, 2, types[i], new Scalar(0));
            Console.WriteLine($"{names[i]} : {padded.Dump()}");
        }

        // 같은 규칙이 필터의 가장자리 결과를 바꿉니다
        using var a = new Mat();
        using var b = new Mat();
        Cv2.Blur(src, a, new Size(3, 3), new Point(-1, -1), BorderTypes.Replicate);
        Cv2.Blur(src, b, new Size(3, 3), new Point(-1, -1), BorderTypes.Constant);
        Console.WriteLine($"Blur + Replicate : {a.Dump()}");
        Console.WriteLine($"Blur + Constant  : {b.Dump()}");
    }
}`;

  // ------------------------------------------------------------------ 2교시 예제
  const EX_NOISEKIND = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var clean = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);

        using var saltMask = new Mat();
        using var pepperMask = new Mat();
        Cv2.Compare(sp, 255, saltMask, CmpType.EQ);
        Cv2.Compare(sp, 0, pepperMask, CmpType.EQ);
        int total = sp.Rows * sp.Cols;
        int salt = Cv2.CountNonZero(saltMask);
        int pepper = Cv2.CountNonZero(pepperMask);
        Console.WriteLine($"전체 픽셀 {total}");
        Console.WriteLine($"소금(255) {salt} = {100.0 * salt / total:F1} %");
        Console.WriteLine($"후추(0)   {pepper} = {100.0 * pepper / total:F1} %");
        Console.WriteLine($"원본(flange) 대비 PSNR = {Cv2.PSNR(clean, sp):F2} dB");

        using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
        using var gclean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
        Console.WriteLine($"가우시안 잡음 영상의 PSNR = {Cv2.PSNR(gclean, noisy):F2} dB");
        Cv2.ImShow("salt_pepper", sp);
        Cv2.WaitKey(0);
    }
}`;

  const EX_MEDIAN = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);

        using var med = new Mat();
        Cv2.MedianBlur(sp, med, 5);              // ksize 는 홀수, 3 이상
        using var gau = new Mat();
        Cv2.GaussianBlur(sp, gau, new Size(5, 5), 0);

        Report("필터 없음", sp);
        Report("Median  ", med);
        Report("Gaussian", gau);
        Cv2.ImShow("salt_pepper", sp);
        Cv2.ImShow("median 5", med);
        Cv2.ImShow("gaussian 5", gau);
        Cv2.WaitKey(0);
    }

    // 이진화 후 윤곽선 전체 개수와, 부모가 있는(내부) 큰 윤곽선 = 구멍 개수
    static void Report(string name, Mat gray)
    {
        using var bin = new Mat();
        Cv2.Threshold(gray, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
        Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                         RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
        int holes = 0;
        for (int i = 0; i < cs.Length; i++)
            if (hi[i].Parent >= 0 && Cv2.ContourArea(cs[i]) > 50) holes++;
        Console.WriteLine($"{name} : 윤곽선 {cs.Length}개, 구멍 {holes}개");
    }
}`;

  const EX_COMPARE = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
        using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
        Console.WriteLine($"잡음 영상        : {Cv2.PSNR(clean, noisy):F2} dB");

        using var box = new Mat();
        Cv2.Blur(noisy, box, new Size(5, 5));
        Console.WriteLine($"Blur(5x5)        : {Cv2.PSNR(clean, box):F2} dB");

        using var gau = new Mat();
        Cv2.GaussianBlur(noisy, gau, new Size(5, 5), 1.5);
        Console.WriteLine($"GaussianBlur(5x5): {Cv2.PSNR(clean, gau):F2} dB");

        using var med = new Mat();
        Cv2.MedianBlur(noisy, med, 5);
        Console.WriteLine($"MedianBlur(5)    : {Cv2.PSNR(clean, med):F2} dB");

        using var bil = new Mat();
        Cv2.BilateralFilter(noisy, bil, 7, 40, 7);   // d, sigmaColor, sigmaSpace
        Console.WriteLine($"Bilateral(7,40,7): {Cv2.PSNR(clean, bil):F2} dB");

        Cv2.ImShow("noisy", noisy);
        Cv2.ImShow("gaussian", gau);
        Cv2.ImShow("bilateral", bil);
        Cv2.WaitKey(0);
    }
}`;

  const EX_BILATERAL = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);

        using var gau = new Mat();
        Cv2.GaussianBlur(noisy, gau, new Size(7, 7), 2);
        using var bil = new Mat();
        Cv2.BilateralFilter(noisy, bil, 7, 50, 7);

        // 사각형(420,150,150x90) 의 왼쪽 에지를 가로지르는 한 줄을 뽑아 비교
        Console.WriteLine("x=340..352 의 밝기 (에지 통과, y=150)");
        Console.Write("원본     :");
        for (int x = 340; x <= 352; x++) Console.Write($" {noisy.At<byte>(150, x),3}");
        Console.WriteLine();
        Console.Write("Gaussian :");
        for (int x = 340; x <= 352; x++) Console.Write($" {gau.At<byte>(150, x),3}");
        Console.WriteLine();
        Console.Write("Bilateral:");
        for (int x = 340; x <= 352; x++) Console.Write($" {bil.At<byte>(150, x),3}");
        Console.WriteLine();
        Cv2.ImShow("gaussian 7x7", gau);
        Cv2.ImShow("bilateral", bil);
        Cv2.WaitKey(0);
    }
}`;

  const EX_UNSHARP = `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
        using var blur = new Mat();
        Cv2.GaussianBlur(img, blur, new Size(0, 0), 3);   // ksize (0,0) → sigma 로 자동 결정

        double[] ks = new double[] { 0.5, 1.0, 2.0 };
        foreach (double k in ks)
        {
            using var sharp = new Mat();
            // 결과 = (1+k)·원본 − k·블러
            Cv2.AddWeighted(img, 1 + k, blur, -k, 0, sharp);
            using var gray = new Mat();
            Cv2.CvtColor(sharp, gray, ColorConversionCodes.BGR2GRAY);
            Cv2.MeanStdDev(gray, out Scalar m, out Scalar sd);
            Console.WriteLine($"k = {k:F1} : 평균 {m.Val0:F1}, 표준편차 {sd.Val0:F2} (클수록 대비가 세다)");
            Cv2.ImShow("unsharp k=" + k, sharp);
        }
        using var g0 = new Mat();
        Cv2.CvtColor(img, g0, ColorConversionCodes.BGR2GRAY);
        Cv2.MeanStdDev(g0, out Scalar m0, out Scalar sd0);
        Console.WriteLine($"원본     : 평균 {m0.Val0:F1}, 표준편차 {sd0.Val0:F2}");
        Cv2.WaitKey(0);
    }
}`;

  const EX_WPF = `// 🪟 WPF: 트랙바(Slider) 로 블러 세기를 바꾸는 이미지 뷰어 (Visual Studio 에서 실행)
using System.Windows;
using OpenCvSharp;
using OpenCvSharp.WpfExtensions;

namespace FilterDemo
{
    public partial class MainWindow : Window
    {
        private Mat src = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);

        public MainWindow() { InitializeComponent(); Apply(3); }

        private void KsizeSlider_ValueChanged(object sender,
            RoutedPropertyChangedEventArgs<double> e) => Apply((int)e.NewValue);

        private void Apply(int k)
        {
            if (src == null || src.Empty()) return;
            int ksize = k % 2 == 0 ? k + 1 : k;          // 커널은 반드시 홀수!
            using var dst = new Mat();
            Cv2.GaussianBlur(src, dst, new Size(ksize, ksize), 0);
            ResultImage.Source = BitmapSourceConverter.ToBitmapSource(dst);
            StatusText.Text = $"GaussianBlur {ksize}x{ksize}";
        }
    }
}`;

  // ------------------------------------------------------------------ 퀴즈
  const QUIZ1 = [
    { q: '<code>Cv2.GaussianBlur(src, dst, new Size(4, 4), 0)</code> 를 실행하면?', options: ['4×4 커널로 잘 동작한다', '커널 크기가 짝수라서 예외가 난다', '자동으로 5×5 로 바뀐다', '결과가 원본과 같다'], answer: 1,
      explain: '블러 커널은 <b>앵커(가운데)</b>가 있어야 하므로 <b>홀수</b>여야 합니다. 짝수를 주면 OpenCV 예외가 납니다. 단 <code>new Size(0, 0)</code> 은 “sigma 로 알아서 정하라”는 특별한 뜻입니다.' },
    { q: '3×3 평균 커널의 가중치 합은 1 입니다. 합이 1 이면 무엇이 보장되나?', options: ['에지가 강조된다', '전체 밝기가 거의 유지된다', '잡음이 완전히 사라진다', '커널이 대칭이 된다'], answer: 1,
      explain: '가중치 합 = 1 이면 평평한 영역의 값이 그대로 유지되므로 <b>전체 밝기가 변하지 않습니다</b>. 합이 0 인 커널(에지 · 엠보싱)은 평평한 곳이 0(검정)이 되므로 <code>delta</code> 로 128 을 더해 주는 경우가 많습니다.' },
    { q: '<code>Cv2.Blur</code> 와 <code>Cv2.BoxFilter</code> 의 관계로 옳은 것은?', options: ['완전히 다른 알고리즘이다', '<code>Blur</code> = <code>BoxFilter(normalize: true)</code>', '<code>Blur</code> 는 가우시안 가중치를 쓴다', '<code>BoxFilter</code> 는 컬러 이미지에 못 쓴다'], answer: 1,
      explain: '<code>Cv2.Blur</code> 는 <code>BoxFilter</code> 의 정규화(합을 커널 칸 수로 나눔) 버전입니다. <code>BoxFilter</code> 에서 <code>normalize: false</code> 를 주면 단순 합이 되어 값이 넘칩니다(포화).' },
    { q: '필터가 이미지 가장자리를 계산할 때 이미지 밖의 값을 만드는 기본 규칙(<code>BorderTypes.Default</code>)은?', options: ['Constant (0 으로 채움)', 'Replicate (끝 값 복사)', 'Reflect101 (맨 끝 값을 빼고 거울)', 'Wrap (반대편에서 가져옴)'], answer: 2,
      explain: '<code>BorderTypes.Default</code> = <code>Reflect101</code> 입니다. <code>10 20 30</code> 의 왼쪽은 <code>30 20 | 10 20 30</code> 처럼 맨 끝 값(10)을 중복하지 않고 거울처럼 채웁니다.' },
    { q: '커널 크기를 3 → 21 로 키우면 일어나는 일이 <u>아닌</u> 것은?', options: ['잡음이 더 많이 줄어든다', '가는 선과 작은 글자가 사라진다', '계산량이 늘어난다', '에지가 더 또렷해진다'], answer: 3,
      explain: '블러 커널이 커지면 더 넓게 평균을 내므로 잡음은 줄지만 <b>에지와 작은 구조가 함께 뭉개집니다</b>. 잡음 제거와 세부 보존은 서로 반대 방향이라 적당한 크기를 찾아야 합니다.' }
  ];

  const QUIZ2 = [
    { q: '소금-후추(임펄스) 잡음에 가장 알맞은 필터는?', options: ['<code>Cv2.Blur</code>', '<code>Cv2.GaussianBlur</code>', '<code>Cv2.MedianBlur</code>', '<code>Cv2.BoxFilter</code>'], answer: 2,
      explain: '평균 계열은 0 · 255 로 튄 값에 끌려가 잡음이 <b>번져서</b> 남습니다. <b>중간값(Median)</b>은 정렬해서 가운데를 고르므로 튄 값이 그냥 버려집니다.' },
    { q: 'PSNR 값에 대한 설명으로 옳은 것은?', options: ['작을수록 원본에 가깝다', '클수록 원본에 가깝다', '단위는 픽셀이다', '두 이미지 크기가 달라도 계산된다'], answer: 1,
      explain: 'PSNR = 10·log<sub>10</sub>(255² / MSE) 이므로 오차(MSE)가 작을수록 <b>커집니다</b>. 단위는 dB 이고, 두 이미지의 크기 · 형식이 같아야 계산됩니다. 보통 30 dB 이상이면 꽤 비슷한 편입니다.' },
    { q: '<code>Cv2.BilateralFilter</code> 가 에지를 살리는 이유는?', options: ['커널이 정사각형이 아니기 때문', '거리뿐 아니라 <b>밝기 차</b>도 가중치에 쓰기 때문', '중간값을 고르기 때문', '이진화를 먼저 하기 때문'], answer: 1,
      explain: '양방향 필터는 (거리 가우시안) × (밝기 차 가우시안) 을 가중치로 씁니다. 밝기가 많이 다른 이웃은 가중치가 거의 0 이 되어 섞이지 않으므로 <b>에지가 남고 면만 매끈해집니다</b>. 대신 느립니다.' },
    { q: '언샤프 마스크를 <code>Cv2.AddWeighted(src, 1.5, blur, -0.5, 0, dst)</code> 로 만들었습니다. k 값은?', options: ['0.5', '1.0', '1.5', '2.0'], answer: 0,
      explain: '언샤프 마스크는 <code>(1+k)·원본 − k·블러</code> 이므로 알파 1.5 = 1+k → <b>k = 0.5</b> 입니다. k 를 키우면 선명해지지만 에지에 흰 테두리(오버슈트)가 생기고 잡음도 강조됩니다.' },
    { q: '검사 라인의 조명 잡음(가우시안)을 줄이면서 치수 측정용 에지는 최대한 지키고 싶습니다. 가장 먼저 시도할 것은?', options: ['<code>MedianBlur(21)</code>', '<code>Blur(21, 21)</code>', '<code>GaussianBlur(3, 3)</code> 또는 <code>BilateralFilter</code>', '필터를 쓰지 않고 이진화만'], answer: 2,
      explain: '가우시안 잡음에는 가우시안 필터가 잘 맞지만 커널이 크면 에지가 밀립니다. <b>작은 커널(3×3)</b> 로 시작하고, 에지를 더 지켜야 하면 <b>BilateralFilter</b> 를 씁니다. 큰 커널은 서브픽셀 에지 위치를 흐트러뜨립니다.' }
  ];

  CS_COURSE.addChapter({
    id: 'cs08', no: '08', title: '필터링: 블러 · 샤프닝 · 잡음 제거', subtitle: '컨볼루션 원리 · Blur / GaussianBlur / MedianBlur / BilateralFilter · Filter2D',
    summary: '커널(kernel)이 이미지 위를 미끄러지며 계산하는 <b>컨볼루션(Convolution)</b> 원리를 익히고, 평균 · 가우시안 · 중간값 · 양방향 필터를 골라 쓰는 기준을 세웁니다. <code>Cv2.Filter2D</code> 로 샤프닝 · 엠보싱 커널을 직접 만들고, <code>Cv2.PSNR</code> 로 잡음 제거 성능을 숫자로 비교합니다.',
    goals: [
      '컨볼루션의 동작(커널 슬라이딩 · 가중치 합 · 경계 처리)을 설명할 수 있다',
      'Blur · GaussianBlur · MedianBlur · BilateralFilter 를 잡음 종류에 맞게 고를 수 있다',
      'Cv2.Filter2D 로 직접 만든 커널(샤프닝 · 엠보싱)을 적용하고 PSNR 로 결과를 평가할 수 있다'
    ],
    wpf: 'Ch16_ImageStudio',
    sections: [
      {
        id: 'cs08-1', title: '컨볼루션과 블러: Blur · GaussianBlur · Filter2D', minutes: 50,
        goals: ['커널이 미끄러지며 곱하고 더하는 컨볼루션 과정을 손으로 계산할 수 있다', 'Blur · BoxFilter · GaussianBlur 의 차이와 커널 크기 효과를 안다', 'Filter2D 로 샤프닝 · 엠보싱 커널을 만들고 BorderTypes 를 설명할 수 있다'],
        flow: [['도입: 왜 흐리게 만드나', 5], ['컨볼루션 원리 · 손계산', 15], ['Blur · Gaussian · 커널 크기', 15], ['Filter2D · 경계 처리', 10], ['정리 · 퀴즈', 5]],
        content: [
          { type: 'h', text: '왜 일부러 흐리게 만드나?' },
          { type: 'p', html: '검사 영상에는 항상 <b>잡음(noise)</b>이 있습니다. 센서의 전기적 잡음, 조명 깜빡임, 먼지 한 점이 이진화 · 에지 검출 결과를 엉망으로 만듭니다. 그래서 대부분의 비전 처리 파이프라인은 <b>필터링(Filtering)</b> 으로 시작합니다. 반대로 흐릿한 영상을 또렷하게 만드는 <b>샤프닝(Sharpening)</b> 도 같은 도구(컨볼루션)로 만듭니다.' },
          { type: 'list', ordered: true, items: [
            '<b>잡음 줄이기</b> — 이진화 · 에지 검출 전처리 (이 차시)',
            '<b>세부 없애기</b> — 배경의 무늬(텍스처)를 지우고 큰 덩어리만 남기기',
            '<b>선명하게</b> — 흐린 렌즈 · 초점 오차 보정 (샤프닝 · 언샤프 마스크)',
            '<b>특정 방향만 보기</b> — 에지 검출도 결국 커널 하나입니다 (10차시)'
          ] },
          { type: 'h', text: '컨볼루션: 커널이 미끄러진다' },
          { type: 'p', html: '<b>커널(kernel, 마스크 · 필터)</b> 은 작은 숫자 표(보통 3×3, 5×5)입니다. 이 커널을 이미지의 모든 픽셀에 차례로 올려놓고, <b>겹친 값끼리 곱해서 모두 더한 값</b>을 그 위치의 새 픽셀 값으로 씁니다. 커널이 이미지 위를 왼쪽 → 오른쪽, 위 → 아래로 미끄러지는 이 계산을 <b>컨볼루션(Convolution)</b> 이라고 합니다.' },
          { type: 'figure', html: FIG_CONV, caption: '그림 1. 3×3 커널이 미끄러지며 출력 픽셀 하나씩을 만든다. 가운데 픽셀(앵커)이 결과의 자리다' },
          { type: 'p', html: '출력 픽셀 하나 = Σ (이웃 값 × 커널 값). 3×3 평균 커널은 모든 칸이 1/9 이므로 결국 <b>9개 이웃의 평균</b>입니다. 튀는 값 하나가 9로 나뉘어 옅어지므로 잡음이 줄고, 대신 에지도 함께 뭉개집니다.' },
          { type: 'code', title: '예제 1: 3×3 평균 커널을 손으로 계산해 보기', code: EX_CONV,
            desc: '<code>img.Clone(new Rect(96, 148, 5, 5))</code> 로 원의 왼쪽 에지 부분 5×5 만 복사해 값을 직접 봅니다(배경 ≈ 67, 원 내부 ≈ 49). 손으로 구한 9개 평균(67.67)과 <code>Cv2.Blur</code> 의 가운데 값(68)이 같으면 컨볼루션을 이해한 것입니다 — OpenCV 는 결과를 반올림합니다. <code>Dump()</code> 는 Mat 의 모든 값을 문자열로 보여 주는 디버깅용 메서드입니다. <code>img.Clone(rect)</code> 는 그 영역만 <b>독립된 복사본</b>으로 만듭니다 — 원본과 메모리를 나누지 않으므로 값을 살펴보거나 바꿔도 원본이 안전합니다.',
            expect: '원본 5x5 ROI:\n[67, 67, 68, 68, 50;\n 67, 67, 68, 68, 49;\n 67, 67, 68, 68, 49;\n 67, 67, 68, 68, 49;\n 67, 67, 68, 68, 50]\n가운데 3x3 합 = 609, 평균 = 67.67\nCv2.Blur 의 가운데 값 = 68\nBlur 결과 5x5:\n[67, 67, 68, 62, 62;\n 67, 67, 68, 62, 62;\n 67, 67, 68, 62, 62;\n 67, 67, 68, 62, 62;\n 67, 67, 68, 62, 62]' },
          { type: 'callout', kind: 'tip', title: '왜 커널은 홀수인가', html: '커널의 결과를 적을 자리(<b>앵커, anchor</b>)가 정확히 가운데여야 결과가 한쪽으로 밀리지 않습니다. 3 · 5 · 7 처럼 홀수만 가운데가 있으므로 OpenCV 는 짝수 커널을 거부합니다(<code>new Size(4, 4)</code> → 예외). 예외적으로 <code>GaussianBlur</code> 의 <code>new Size(0, 0)</code> 은 “sigma 에서 크기를 계산하라”는 뜻입니다.' },
          { type: 'h', text: '평균 블러와 가우시안 블러' },
          { type: 'figure', html: FIG_KERNEL2, caption: '그림 2. 평균 커널은 모든 이웃을 똑같이 섞고, 가우시안 커널은 가까운 이웃에 큰 가중치를 준다' },
          { type: 'table', head: ['함수', 'Python', '커널', '특징'], rows: [
            ['<code>Cv2.Blur(src, dst, size)</code>', '<code>cv2.blur</code>', '모두 1/(w·h)', '가장 빠름. 네모난 번짐 · 링잉이 보인다'],
            ['<code>Cv2.BoxFilter(src, dst, ddepth, size, ..., normalize)</code>', '<code>cv2.boxFilter</code>', '모두 1 (또는 1/n)', '<code>normalize:false</code> 면 단순 합 → 값이 포화된다'],
            ['<code>Cv2.GaussianBlur(src, dst, size, sigmaX)</code>', '<code>cv2.GaussianBlur</code>', '종 모양 가중치', '가장 널리 쓰임. 자연스러운 번짐, 전처리 표준'],
            ['<code>Cv2.MedianBlur(src, dst, ksize)</code>', '<code>cv2.medianBlur</code>', '커널 없음(정렬)', '임펄스 잡음에 강함 (2교시)'],
            ['<code>Cv2.Filter2D(src, dst, ddepth, kernel)</code>', '<code>cv2.filter2D</code>', '내가 만든 커널', '샤프닝 · 엠보싱 · 방향 필터']
          ], caption: '표 1. 이 차시에서 쓰는 필터 함수' },
          { type: 'p', html: '<code>GaussianBlur</code> 의 세 번째 인수 <code>sigmaX</code> 는 종 모양의 폭입니다. <b>0 을 주면 커널 크기에서 자동 계산</b>(σ ≈ 0.3·((ksize−1)/2 − 1) + 0.8)되고, 반대로 <code>new Size(0, 0)</code> 을 주면 σ 에서 커널 크기를 계산합니다. 둘 중 하나만 정하면 됩니다.' },
          { type: 'code', title: '예제 2: Blur · BoxFilter · GaussianBlur 를 PSNR 로 비교', code: EX_BLUR,
            desc: '<code>images/gradient_noise.png</code> 는 <code>gradient_clean.png</code> 에 가우시안 잡음(σ=15)을 더한 영상입니다. 정답 영상이 있으니 <b><code>Cv2.PSNR</code>(Peak Signal-to-Noise Ratio, dB)</b> 로 “얼마나 원본에 가까운가”를 숫자로 볼 수 있습니다. <b>클수록 좋습니다.</b> 잡음 영상은 약 24.7 dB 인데 필터를 거치면 올라갑니다.',
            expect: '필터 없음         PSNR = 24.67 dB\nBlur(3x3)         PSNR = 30.16 dB\nBoxFilter(3x3)    PSNR = 30.16 dB  (Blur 와 같다)\nGaussianBlur(3x3) PSNR = 30.82 dB\nGaussianBlur(5x5, sigma 1.5) PSNR = 29.61 dB' },
          { type: 'image', src: 'images/gradient_noise.png', caption: 'gradient_noise.png — 그라데이션 배경 위 도형과 가는 세로선 6개. 커널을 키우면 가는 선부터 사라진다', width: 420 },
          { type: 'code', title: '예제 3: 커널 크기 3 · 9 · 21 효과 비교', code: EX_KSIZE,
            desc: '결과 창의 세 이미지를 나란히 보세요. 3×3 은 잡음만 살짝 줄이고, 9×9 는 매끈하지만 가는 세로선이 희미해지고, 21×21 은 글자 “FILTER 3x3” 까지 읽을 수 없습니다. <b>표준편차(Val0)</b> 가 줄어드는 것은 영상의 대비가 함께 줄었다는 뜻입니다. PSNR 도 어느 지점을 지나면 다시 나빠집니다 — 잡음보다 신호를 더 많이 지우기 때문입니다.',
            expect: 'ksize  3x3  PSNR 30.82 dB, 표준편차 62.54\nksize  9x9  PSNR 28.30 dB, 표준편차 61.25\nksize 21x21 PSNR 24.59 dB, 표준편차 59.77' },
          { type: 'callout', kind: 'warn', title: '흔한 실수 세 가지', html: '<ul><li><b>짝수 커널</b>: <code>new Size(4, 4)</code> → 예외. 트랙바 값을 쓸 때는 <code>k % 2 == 0 ? k + 1 : k</code> 로 홀수로 만드세요.</li><li><b>MedianBlur 의 ksize 는 <u>정수 하나</u></b>: <code>Cv2.MedianBlur(src, dst, 5)</code> 이고 <code>new Size(5,5)</code> 가 아닙니다.</li><li><b>src 와 dst 를 같은 Mat 으로</b>: 대부분 동작하지만(in-place) <code>BilateralFilter</code> 처럼 안 되는 함수가 있습니다. 새 <code>Mat</code> 을 쓰는 습관을 들이세요.</li></ul>' },
          { type: 'h', text: 'Filter2D: 커널을 직접 만든다' },
          { type: 'p', html: '<code>Cv2.Filter2D</code> 에 내가 만든 커널을 넘기면 어떤 선형 필터든 만들 수 있습니다. 커널은 실수 커널이므로 <code>MatType.CV_32FC1</code> 로 만듭니다.' },
          { type: 'table', head: ['커널', '값 (3×3)', '합', '효과'], rows: [
            ['샤프닝', '0 −1 0 / −1 <b>5</b> −1 / 0 −1 0', '1', '가운데를 키우고 이웃을 빼서 대비 강조'],
            ['강한 샤프닝', '−1 −1 −1 / −1 <b>9</b> −1 / −1 −1 −1', '1', '더 세지만 잡음도 같이 강조'],
            ['엠보싱', '−2 −1 0 / −1 <b>1</b> 1 / 0 1 2', '1', '한쪽 방향 차이만 남겨 도장 느낌 (delta 128)'],
            ['평균', '1/9 × 전부 1', '1', '<code>Cv2.Blur(src, dst, new Size(3,3))</code> 과 같다'],
            ['가로 에지', '−1 −1 −1 / 0 <b>0</b> 0 / 1 1 1', '0', '가로 방향 밝기 변화 (10차시 Sobel 의 뼈대)']
          ], caption: '표 2. 자주 쓰는 3×3 커널. 합이 1 이면 밝기 유지, 0 이면 평평한 곳이 검정이 된다' },
          { type: 'code', title: '예제 4: Filter2D 로 샤프닝 · 엠보싱', code: EX_FILTER2D,
            desc: '커널은 <code>new Mat(3, 3, MatType.CV_32FC1, new float[] { ... })</code> 로 만듭니다. 값은 <b>행 우선(row-major)</b>: 첫 3개가 첫 줄입니다. 엠보싱 커널처럼 합이 0 이면 결과가 0 근처로 몰려 거의 검정이 되므로 <code>Filter2D</code> 의 <code>delta</code> 인수에 128 을 주어 회색을 기준으로 삼습니다. <code>ddepth</code> 에 <code>MatType.CV_8UC3</code> 을 주면 결과가 0~255 로 잘립니다(포화).',
            expect: '샤프닝 커널:\n[0, -1, 0;\n -1, 5, -1;\n 0, -1, 0]\n원본 평균   B115.5\n샤프닝 평균 B115.5  (커널 합이 1 이라 밝기는 거의 그대로)\n엠보싱 평균 B128.5  (합이 0 + delta 128 → 회색 주변)' },
          { type: 'callout', kind: 'tip', title: '엄밀히 말하면 상관(Correlation)', html: 'OpenCV 의 <code>filter2D</code> 는 커널을 180° 돌리지 않고 그대로 곱합니다 — 수학적으로는 <b>상관(correlation)</b> 입니다. 우리가 쓰는 커널은 대부분 대칭이라 결과가 같지만, 비대칭 커널(엠보싱 등)에서는 방향이 반대가 됩니다. 진짜 컨볼루션이 필요하면 <code>Cv2.Flip(kernel, k, FlipMode.XY)</code> 로 커널을 뒤집어 넘기세요.' },
          { type: 'h', text: '가장자리는 어떻게? — BorderTypes' },
          { type: 'p', html: '왼쪽 맨 위 픽셀에 3×3 커널을 올리면 이미지 밖의 값이 필요합니다. OpenCV 는 밖의 값을 만드는 규칙을 <code>BorderTypes</code> 로 고르게 합니다. 기본값은 <code>BorderTypes.Default</code> = <code>Reflect101</code> 입니다.' },
          { type: 'figure', html: FIG_BORDER, caption: '그림 3. 이미지 밖의 값을 만드는 네 가지 방법. 기본값은 Reflect101' },
          { type: 'code', title: '예제 5: 경계 처리 규칙을 눈으로 확인', code: EX_BORDER,
            desc: '<code>Cv2.CopyMakeBorder</code> 로 실제로 테두리를 붙여 값을 찍어 봅니다. <code>Constant</code> 는 밖을 0 으로 채우므로 <b>가장자리가 어두워지는</b> 문제가 생깁니다 — 조명 검사나 정규화에서 오차의 원인이 됩니다. 특별한 이유가 없으면 기본값(<code>Reflect101</code>)이나 <code>Replicate</code> 를 쓰세요.',
            expect: 'Constant   : [0, 0, 10, 20, 30, 40, 50, 0, 0]\nReplicate  : [10, 10, 10, 20, 30, 40, 50, 50, 50]\nReflect    : [20, 10, 10, 20, 30, 40, 50, 50, 40]\nReflect101 : [30, 20, 10, 20, 30, 40, 50, 40, 30]\nBlur + Replicate : [13, 20, 30, 40, 47]\nBlur + Constant  : [3, 7, 10, 13, 10]' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: '슬라이더(Slider)로 커널 크기를 바꾸면 사용자가 필터 효과를 즉시 볼 수 있습니다. 주의할 점 두 가지: ① 슬라이더 값이 짝수일 수 있으니 <b>홀수로 보정</b>할 것 ② <code>ValueChanged</code> 가 아주 자주 불리므로 매번 <code>new Mat()</code> 을 만들면 GC 부담이 큽니다 — <code>using</code> 으로 확실히 해제하거나 결과 Mat 을 필드로 재사용하세요.' },
          { type: 'code', title: '참고: 슬라이더로 블러 세기 바꾸기 (WPF)', code: EX_WPF, run: false, local: true, file: 'MainWindow.xaml.cs',
            desc: '같은 <code>Cv2.GaussianBlur</code> 호출이 WPF 에서는 <code>BitmapSourceConverter.ToBitmapSource</code> 로 <code>Image</code> 컨트롤에 표시됩니다. 브라우저 예제와 처리 코드는 완전히 같습니다.' }
        ],
        practice: [
          {
            title: '내 커널로 세로 방향 에지만 강조하기', level: 2,
            desc: '<code>Cv2.Filter2D</code> 로 <b>세로 방향 밝기 변화</b>를 강조하는 3×3 커널 <code>[-1 0 1; -2 0 2; -1 0 1]</code> 을 만들어 <code>images/gradient_clean.png</code> 에 적용하세요. 합이 0 인 커널이므로 <code>delta</code> 에 128 을 주어 회색 기준으로 보이게 하고, 결과의 평균 · 표준편차를 출력하세요. 커널을 <code>[-1 -2 -1; 0 0 0; 1 2 1]</code> 로 바꾸면 무엇이 강조되는지 결과 창에서 비교해 보세요.',
            hint: '커널은 <code>new Mat(3, 3, MatType.CV_32FC1, new float[] { -1, 0, 1, -2, 0, 2, -1, 0, 1 })</code>. <code>Cv2.Filter2D(src, dst, MatType.CV_8UC1, kernel, new Point(-1, -1), 128)</code>. 통계는 <code>Cv2.MeanStdDev(dst, out Scalar m, out Scalar sd)</code>. 이 커널의 이름이 바로 10차시에서 배울 <b>Sobel</b> 입니다.',
            expect: '세로 에지 강조: 평균 130.0, 표준편차 22.00\n가로 에지 강조: 평균 128.0, 표준편차 16.23',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);

        // TODO: 세로 에지 커널 [-1 0 1; -2 0 2; -1 0 1] 을 CV_32FC1 로 만드세요
        using var kx = new Mat(3, 3, MatType.CV_32FC1,
            new float[] { 0, 0, 0, 0, 1, 0, 0, 0, 0 });   // 지금은 아무것도 안 하는 커널

        using var dst = new Mat();
        Cv2.Filter2D(img, dst, MatType.CV_8UC1, kx, new Point(-1, -1), 128);
        Cv2.MeanStdDev(dst, out Scalar m, out Scalar sd);
        Console.WriteLine($"평균 {m.Val0:F1}, 표준편차 {sd.Val0:F2}");

        Cv2.ImShow("vertical edge", dst);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var img = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);

        using var kx = new Mat(3, 3, MatType.CV_32FC1,
            new float[] { -1, 0, 1, -2, 0, 2, -1, 0, 1 });    // 세로 에지 (x 방향 미분)
        using var ky = new Mat(3, 3, MatType.CV_32FC1,
            new float[] { -1, -2, -1, 0, 0, 0, 1, 2, 1 });    // 가로 에지 (y 방향 미분)

        using var dx = new Mat();
        using var dy = new Mat();
        Cv2.Filter2D(img, dx, MatType.CV_8UC1, kx, new Point(-1, -1), 128);
        Cv2.Filter2D(img, dy, MatType.CV_8UC1, ky, new Point(-1, -1), 128);
        Cv2.MeanStdDev(dx, out Scalar mx, out Scalar sx);
        Cv2.MeanStdDev(dy, out Scalar my, out Scalar sy);
        Console.WriteLine($"세로 에지 강조: 평균 {mx.Val0:F1}, 표준편차 {sx.Val0:F2}");
        Console.WriteLine($"가로 에지 강조: 평균 {my.Val0:F1}, 표준편차 {sy.Val0:F2}");

        Cv2.ImShow("vertical edge", dx);
        Cv2.ImShow("horizontal edge", dy);
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '가장 좋은 가우시안 커널 크기 찾기', level: 1,
            desc: '<code>images/gradient_noise.png</code> 에 <code>Cv2.GaussianBlur</code> 를 커널 3, 5, 7, 9, 11 로 적용하고 <code>images/gradient_clean.png</code> 대비 PSNR 을 출력하세요. PSNR 이 가장 큰 커널 크기와 그때의 값을 마지막 줄에 출력하세요.',
            hint: '<code>for (int k = 3; k <= 11; k += 2)</code> 로 홀수만 돌리고, <code>double best = -1; int bestK = 0;</code> 를 두고 갱신하세요. PSNR 은 <code>Cv2.PSNR(clean, dst)</code>.',
            expect: 'ksize  3 : PSNR 30.82 dB\nksize  5 : PSNR 30.54 dB\nksize  7 : PSNR 29.26 dB\nksize  9 : PSNR 28.30 dB\nksize 11 : PSNR 27.42 dB\n가장 좋은 커널 = 3x3 (30.82 dB)',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
        using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);

        for (int k = 3; k <= 11; k += 2)
        {
            using var dst = new Mat();
            Cv2.GaussianBlur(noisy, dst, new Size(k, k), 0);
            // TODO: PSNR 을 출력하고 가장 큰 값을 기억하세요
            Console.WriteLine($"ksize {k}");
        }
        // TODO: 가장 좋은 커널 크기를 출력하세요
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
        using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);

        double best = -1;
        int bestK = 0;
        for (int k = 3; k <= 11; k += 2)
        {
            using var dst = new Mat();
            Cv2.GaussianBlur(noisy, dst, new Size(k, k), 0);
            double p = Cv2.PSNR(clean, dst);
            Console.WriteLine($"ksize {k,2} : PSNR {p:F2} dB");
            if (p > best) { best = p; bestK = k; }
        }
        Console.WriteLine($"가장 좋은 커널 = {bestK}x{bestK} ({best:F2} dB)");
    }
}`
          }
        ],
        quiz: QUIZ1,
        slides: [
          { layout: 'title', title: '필터링 ① 컨볼루션과 블러', subtitle: '커널이 미끄러진다 — Blur · GaussianBlur · Filter2D', notes: '<p>💬 “카메라로 찍은 사진을 확대해 보면 왜 알록달록한 점이 보일까요?” — 센서 잡음. 이 차시는 그 점들을 지우는 방법과, 같은 도구로 오히려 선명하게 만드는 방법을 배웁니다. 07차시 이진화에서 잡음 때문에 결과가 지저분했던 경험을 떠올리게 합니다. (3분)</p>' },
          { layout: 'bullets', title: '왜 필터링부터 배우나', lead: '거의 모든 비전 파이프라인의 첫 단계', bullets: [
            '잡음 한 점이 <b>이진화 · 에지 검출</b> 결과를 망친다',
            '필터 = <b>커널(작은 숫자 표)</b> 을 이미지에 미끄러뜨리는 계산 = 컨볼루션',
            '같은 도구로 <b>흐리게(블러)</b> 도, <b>또렷하게(샤프닝)</b> 도 만든다',
            ['이 교시에서', ['손으로 3×3 평균 계산 → Cv2.Blur 와 비교', 'GaussianBlur 와 커널 크기 효과', 'Filter2D 로 내 커널 만들기']]
          ], notes: '<p>필터는 목적이 두 가지(잡음 제거 · 강조)라는 점을 먼저 말해 둡니다. 다음 교시는 잡음 종류별 대응, 10차시는 에지 커널로 이어진다고 지도를 그려 줍니다. (4분)</p>' },
          { layout: 'diagram', title: '컨볼루션: 커널이 미끄러진다', html: FIG_CONV, caption: '3×3 이웃 × 커널 → 곱해서 더한 값이 출력 픽셀 하나', notes: '<p>칠판(판서)으로 한 칸 옮겨 가며 두 번째 픽셀도 함께 계산해 봅니다. 💬 “가운데 90 은 어디로 갔을까요?” — 68 로 묻혔다 = 블러. 💬 “왼쪽 맨 끝 픽셀은 어떻게 계산할까요?” — 이미지 밖이 필요하다 → 뒤에서 BorderTypes 로 이어집니다. (8분)</p>' },
          { layout: 'code', title: '손계산 = Cv2.Blur 확인', code: `using var img = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
using var roi = img.Clone(new Rect(96, 148, 5, 5));   // 원의 왼쪽 에지
Console.WriteLine(roi.Dump());

int sum = 0;
for (int dy = -1; dy <= 1; dy++)
    for (int dx = -1; dx <= 1; dx++)
        sum += roi.At<byte>(2 + dy, 2 + dx);
Console.WriteLine($"3x3 합 {sum}, 평균 {sum / 9.0:F2}");

using var blurred = new Mat();
Cv2.Blur(roi, blurred, new Size(3, 3));
Console.WriteLine($"Blur 가운데 = {blurred.At<byte>(2, 2)}");`, points: ['<code>Dump()</code> 로 Mat 값을 그대로 확인', '<code>At&lt;byte&gt;(행, 열)</code> 순서 주의', '손 평균 ≈ Blur 의 가운데 값 → 컨볼루션 확인'], notes: '<p>학생이 직접 <code>Rect</code> 위치를 바꿔 다른 자리에서도 확인하게 합니다. 반올림 때문에 1 차이가 날 수 있다고 미리 말해 둡니다. 여기서 <b>(행, 열)</b> 순서를 다시 강조합니다. (8분)</p>' },
          { layout: 'diagram', title: '평균 커널 vs 가우시안 커널', html: FIG_KERNEL2, caption: '평균은 평평한 가중치, 가우시안은 종 모양 가중치', notes: '<p>💬 “멀리 있는 픽셀과 바로 옆 픽셀을 똑같이 믿어도 될까요?” — 가까운 이웃이 더 비슷하다 → 가우시안. 실무 전처리의 기본값은 <code>GaussianBlur</code> 라고 못 박아 줍니다. (5분)</p>' },
          { layout: 'code', title: 'PSNR 로 성능을 숫자로', code: `using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
Console.WriteLine($"필터 없음  {Cv2.PSNR(clean, noisy):F2} dB");

using var box = new Mat();
Cv2.Blur(noisy, box, new Size(3, 3));
Console.WriteLine($"Blur 3x3   {Cv2.PSNR(clean, box):F2} dB");

using var gau = new Mat();
Cv2.GaussianBlur(noisy, gau, new Size(5, 5), 1.5);
Console.WriteLine($"Gauss 5x5  {Cv2.PSNR(clean, gau):F2} dB");
Cv2.ImShow("gauss", gau);
Cv2.WaitKey(0);`, points: ['정답 영상이 있으면 PSNR(dB) 로 비교 — <b>클수록 좋다</b>', '잡음 영상은 약 24.7 dB', 'sigma 0 = 커널 크기에서 자동 계산'], notes: '<p>PSNR = 10·log₁₀(255²/MSE). 💬 “그럼 커널을 아주 크게 하면 PSNR 이 계속 올라갈까요?” — 다음 슬라이드에서 확인. (6분)</p>' },
          { layout: 'code', title: '커널 크기 3 · 9 · 21', code: `using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);

int[] sizes = new int[] { 3, 9, 21 };
foreach (int k in sizes)
{
    using var dst = new Mat();
    Cv2.GaussianBlur(noisy, dst, new Size(k, k), 0);
    Cv2.MeanStdDev(dst, out Scalar m, out Scalar sd);
    Console.WriteLine($"ksize {k}: PSNR {Cv2.PSNR(clean, dst):F2} dB, 표준편차 {sd.Val0:F2}");
    Cv2.ImShow("gaussian " + k, dst);
}
Cv2.WaitKey(0);`, points: ['3×3 → 잡음만 살짝, 21×21 → 글자도 사라짐', '표준편차가 줄면 대비도 줄었다는 뜻', '잡음 제거와 세부 보존은 서로 반대 방향'], notes: '<p>결과 창의 세 이미지를 나란히 놓고 가는 세로선(굵기 2~7 px)이 어디서부터 사라지는지 찾게 합니다. 💬 “치수를 재야 하는 검사에서 21×21 블러를 쓰면 어떻게 될까요?” — 에지가 밀려 측정값이 틀어진다. (6분)</p>' },
          { layout: 'table', title: '필터 함수 한눈에', head: ['함수', '커널', '특징'], rows: [
            ['<code>Cv2.Blur</code>', '전부 1/n', '가장 빠름, 네모난 번짐'],
            ['<code>Cv2.BoxFilter</code>', '1 또는 1/n', '<code>normalize:false</code> 면 단순 합'],
            ['<code>Cv2.GaussianBlur</code>', '종 모양', '전처리 표준'],
            ['<code>Cv2.MedianBlur</code>', '정렬 후 가운데', '임펄스 잡음 (2교시)'],
            ['<code>Cv2.Filter2D</code>', '내 커널', '샤프닝 · 엠보싱 · 에지']
          ], notes: '<p>표를 보며 “내가 만들 검사 프로그램에서는 무엇을 쓸까” 생각하게 합니다. MedianBlur 의 ksize 가 <b>정수 하나</b>라는 점을 꼭 짚습니다. (3분)</p>' },
          { layout: 'code', title: 'Filter2D: 샤프닝 커널', code: `using var img = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);

using var sharpK = new Mat(3, 3, MatType.CV_32FC1,
    new float[] { 0, -1, 0, -1, 5, -1, 0, -1, 0 });
using var sharp = new Mat();
Cv2.Filter2D(img, sharp, MatType.CV_8UC3, sharpK);

using var embossK = new Mat(3, 3, MatType.CV_32FC1,
    new float[] { -2, -1, 0, -1, 0, 1, 0, 1, 2 });
using var emboss = new Mat();
Cv2.Filter2D(img, emboss, MatType.CV_8UC3, embossK, new Point(-1, -1), 128);

Cv2.ImShow("sharpen", sharp);
Cv2.ImShow("emboss", emboss);
Cv2.WaitKey(0);`, points: ['커널은 <code>CV_32FC1</code>, 값은 <b>행 우선</b>', '합 1 → 밝기 유지 / 합 0 → <code>delta</code> 128 필요', '5 를 9 로 바꾸면 더 세지만 잡음도 강조'], notes: '<p>가운데 값 5 를 6, 9 로 바꿔 실행해 보게 합니다. 💬 “샤프닝이 잡음을 늘리는 이유는?” — 잡음도 이웃과 다른 값이므로 함께 강조된다. 여기서 “선명하게 = 차이 강조”라는 직관을 만듭니다. (7분)</p>' },
          { layout: 'diagram', title: '가장자리는 어떻게? BorderTypes', html: FIG_BORDER, caption: '기본값은 Reflect101 — Constant 는 가장자리를 어둡게 만든다', notes: '<p>💬 “Constant(0) 로 하면 검사 영상의 가장자리에서 어떤 문제가 생길까요?” — 테두리가 어두워져 가짜 에지 · 가짜 결함. 실무 기본값은 그대로 두는 것이 안전하다고 정리합니다. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '<code>Cv2.GaussianBlur(src, dst, new Size(4, 4), 0)</code> 을 실행하면?', options: ['4×4 커널로 잘 동작한다', '커널이 짝수라서 예외가 난다', '자동으로 5×5 가 된다', '결과가 원본과 같다'], answer: 1, explain: '커널은 앵커(가운데)가 필요하므로 <b>홀수</b>여야 합니다. <code>new Size(0, 0)</code> 만 “sigma 로 정하라”는 예외입니다.', notes: '<p>정답 2번. 실제로 편집기에서 4 를 넣고 실행해 오류 메시지를 함께 읽습니다 — 오류를 읽는 습관을 들입니다. (3분)</p>' },
          { layout: 'practice', title: '실습: 내 커널로 세로 에지 강조', desc: '<p><code>[-1 0 1; -2 0 2; -1 0 1]</code> 커널을 만들어 <code>gradient_clean.png</code> 에 적용하고 평균 · 표준편차를 출력하세요.</p><ul><li>합이 0 → <code>delta</code> 128</li><li>커널을 <code>[-1 -2 -1; 0 0 0; 1 2 1]</code> 로 바꾸면 무엇이 강조되나?</li></ul>', starter: `using var img = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);

// TODO: 세로 에지 커널을 만드세요
using var kx = new Mat(3, 3, MatType.CV_32FC1,
    new float[] { 0, 0, 0, 0, 1, 0, 0, 0, 0 });

using var dst = new Mat();
Cv2.Filter2D(img, dst, MatType.CV_8UC1, kx, new Point(-1, -1), 128);
Cv2.MeanStdDev(dst, out Scalar m, out Scalar sd);
Console.WriteLine($"평균 {m.Val0:F1}, 표준편차 {sd.Val0:F2}");
Cv2.ImShow("vertical edge", dst);
Cv2.WaitKey(0);`, solution: `using var img = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);

using var kx = new Mat(3, 3, MatType.CV_32FC1,
    new float[] { -1, 0, 1, -2, 0, 2, -1, 0, 1 });
using var ky = new Mat(3, 3, MatType.CV_32FC1,
    new float[] { -1, -2, -1, 0, 0, 0, 1, 2, 1 });

using var dx = new Mat();
using var dy = new Mat();
Cv2.Filter2D(img, dx, MatType.CV_8UC1, kx, new Point(-1, -1), 128);
Cv2.Filter2D(img, dy, MatType.CV_8UC1, ky, new Point(-1, -1), 128);
Cv2.MeanStdDev(dx, out Scalar mx, out Scalar sx);
Console.WriteLine($"세로 에지: 평균 {mx.Val0:F1}, 표준편차 {sx.Val0:F2}");
Cv2.ImShow("vertical edge", dx);
Cv2.ImShow("horizontal edge", dy);
Cv2.WaitKey(0);`, notes: '<p>세로선이 밝게/어둡게 쌍으로 나타나는 것을 확인시킵니다. 이 커널의 이름이 <b>Sobel</b> 이고 10차시에서 <code>Cv2.Sobel</code> 한 줄로 쓴다고 예고하면 동기가 생깁니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['필터 = 커널을 미끄러뜨려 곱하고 더하기(컨볼루션). 커널은 <b>홀수</b>', '<code>Blur</code>(평균) · <code>BoxFilter</code> · <code>GaussianBlur</code>(종 모양, 전처리 표준)', '커널을 키우면 잡음 ↓ 이지만 에지 · 가는 선도 함께 사라진다', '<code>Filter2D</code> + <code>CV_32FC1</code> 커널 → 샤프닝 · 엠보싱 (합 0 이면 <code>delta</code>)', '가장자리 규칙 <code>BorderTypes.Default</code> = <code>Reflect101</code>', '다음 교시: 잡음 종류에 따라 필터를 고른다 (Median · Bilateral · PSNR)'], notes: '<p>세 가지를 기억하게 합니다: 홀수 커널 · 커널 합의 의미 · 가우시안이 기본. 다음 교시 예고: 소금-후추 잡음에는 가우시안이 아예 안 통한다는 것을 보여 준다고 예고합니다. (2분)</p>' }
        ]
      },
      {
        id: 'cs08-2', title: '잡음 제거: Median · Bilateral · PSNR · 언샤프 마스크', minutes: 50,
        goals: ['가우시안 잡음과 임펄스 잡음을 구분하고 알맞은 필터를 고를 수 있다', 'MedianBlur 가 임펄스 잡음을 지우고 구조를 보존하는 것을 결과로 확인할 수 있다', 'BilateralFilter · 언샤프 마스크를 적용하고 PSNR 로 평가할 수 있다'],
        flow: [['도입: 잡음 종류', 8], ['MedianBlur 실습', 14], ['BilateralFilter · PSNR', 13], ['언샤프 마스크 · 선택 가이드', 10], ['정리 · 퀴즈', 5]],
        content: [
          { type: 'h', text: '잡음에도 종류가 있다' },
          { type: 'p', html: '1교시에서 배운 가우시안 블러는 만능이 아닙니다. <b>잡음의 성질</b>에 따라 알맞은 필터가 다릅니다. 산업 현장에서 만나는 잡음은 크게 두 가지입니다.' },
          { type: 'figure', html: FIG_NOISE, caption: '그림 4. 가우시안 잡음은 모든 픽셀이 조금씩 흔들리고, 임펄스 잡음은 일부 픽셀만 0 · 255 로 튄다' },
          { type: 'table', head: ['잡음', '원인', '모습', '알맞은 필터'], rows: [
            ['가우시안(Gaussian)', '센서 열잡음 · 낮은 노출 · 높은 게인', '전체가 자글자글', '<b>GaussianBlur</b> · Blur · Bilateral'],
            ['임펄스(소금-후추)', '전송 오류 · 불량 화소(dead pixel) · 먼지', '흰 점 · 검은 점이 흩뿌려짐', '<b>MedianBlur</b>'],
            ['주기 잡음', '조명 깜빡임 · 격자 무늬', '규칙적인 줄무늬', 'DFT 노치 필터 (심화)'],
            ['얼룩 · 조명 기울기', '불균일 조명', '넓게 밝고 어두움', '큰 커널 배경 추정 · 모폴로지 (09차시)']
          ], caption: '표 3. 잡음 종류와 대응. 먼저 “어떤 잡음인가”를 보는 것이 순서다' },
          { type: 'image', src: 'images/salt_pepper.png', caption: 'salt_pepper.png — flange.png 에 소금 4% + 후추 4% 임펄스 잡음을 넣은 영상. 원본에는 구멍이 7개(중앙 보어 1 + 볼트 구멍 6) 있다', width: 420 },
          { type: 'code', title: '예제 1: 잡음의 정체를 숫자로 확인', code: EX_NOISEKIND,
            desc: '<code>Cv2.Compare(sp, 255, mask, CmpType.EQ)</code> 는 값이 정확히 255 인 픽셀만 255 로 표시한 마스크를 만듭니다. <code>Cv2.CountNonZero</code> 로 세면 소금 · 후추 비율이 각각 약 4% 로 나옵니다. 가우시안 잡음 영상(<code>gradient_noise</code>)은 PSNR 이 24.67 dB 인데, <b>8% 만 망가진 임펄스 잡음 영상이 오히려 PSNR 이 더 낮습니다</b>(15.54 dB) — 망가진 픽셀의 오차가 매우 크기 때문입니다.',
            expect: '전체 픽셀 307200\n소금(255) 12125 = 3.9 %\n후추(0)   12206 = 4.0 %\n원본(flange) 대비 PSNR = 15.54 dB\n가우시안 잡음 영상의 PSNR = 24.67 dB' },
          { type: 'h', text: 'MedianBlur: 정렬해서 가운데를 고른다' },
          { type: 'p', html: '중간값 필터는 곱셈 · 덧셈이 아니라 <b>정렬</b>을 씁니다. 커널 안의 값을 크기 순으로 줄 세우고 정확히 가운데 값을 고릅니다. 그래서 0 이나 255 로 튄 값은 양 끝으로 밀려나 <b>선택되지 않습니다</b>. 가중치가 없는 <b>비선형(non-linear) 필터</b> 입니다.' },
          { type: 'figure', html: FIG_MEDIAN, caption: '그림 5. 중간값은 튄 값 하나에 끌려가지 않는다. 평균은 83 으로 번지고 중간값은 62 로 깨끗하다' },
          { type: 'code', title: '예제 2: MedianBlur 는 잡음만 지우고 구멍 7개를 지킨다', code: EX_MEDIAN,
            desc: '<code>flange.png</code> 원본에는 구멍이 <b>7개</b>(중앙 보어 1 + 볼트 구멍 6) 있습니다. 세 경우 모두 “면적 50 이 넘는 큰 구멍”은 7개로 잘 나오지만, <b>윤곽선 총 개수</b>를 보면 차이가 확연합니다. 필터 없이 이진화하면 잡음 점 하나하나가 윤곽선이 되어 <b>1만 개가 넘고</b>, <code>GaussianBlur(5×5)</code> 는 점을 <b>회색으로 번지게만</b> 해서 얼룩 윤곽선이 <b>77개</b> 남습니다. <code>MedianBlur(5)</code> 는 <b>8개</b>(외곽 1 + 구멍 7)로 완벽하게 정리됩니다. 실무에서 “작은 윤곽선을 면적으로 걸러내면 되지 않나?” 싶지만, 잡음 윤곽선이 1만 개면 <code>FindContours</code> 자체가 느려지고 결함 크기의 잡음은 걸러낼 수도 없습니다. 구멍은 <code>RetrievalModes.CComp</code> 로 찾은 윤곽선 중 <b>부모가 있는(내부) 윤곽선</b> 개수로 셉니다 (12차시에서 자세히).',
            expect: '필터 없음 : 윤곽선 10399개, 구멍 7개\nMedian   : 윤곽선 8개, 구멍 7개\nGaussian : 윤곽선 77개, 구멍 7개' },
          { type: 'callout', kind: 'warn', title: 'MedianBlur 주의점', html: '<ul><li><code>ksize</code> 는 <b>정수 하나</b>(3, 5, 7…)이고 홀수여야 합니다. <code>new Size(5,5)</code> 를 넘기면 오류입니다.</li><li>8비트 영상에서 <code>ksize</code> 5 이하는 매우 빠르지만 7 이상은 느려집니다.</li><li>커널이 크면 <b>가는 선 · 작은 점이 아예 지워집니다</b>. 0.5 px 급 결함을 찾는 검사에서는 위험합니다 — 결함까지 잡음으로 지워 버릴 수 있습니다.</li></ul>' },
          { type: 'h', text: 'BilateralFilter: 에지는 남기고 면만 매끈하게' },
          { type: 'p', html: '가우시안 블러는 “가까운 이웃일수록 많이 섞는다”만 봅니다. <b>양방향 필터(Bilateral Filter)</b> 는 여기에 “<b>밝기가 비슷한 이웃일수록 많이 섞는다</b>”를 곱합니다. 그래서 에지 반대편의 아주 다른 밝기는 거의 섞이지 않고, 같은 면 안의 잡음만 지워집니다.' },
          { type: 'figure', html: FIG_BILATERAL, caption: '그림 6. 양방향 필터는 거리 × 밝기 차 가중치로 에지를 보존한다' },
          { type: 'p', html: '<code>Cv2.BilateralFilter(src, dst, d, sigmaColor, sigmaSpace)</code> — <code>d</code> 는 이웃의 지름(0 이면 <code>sigmaSpace</code> 에서 계산), <code>sigmaColor</code> 는 “얼마나 다른 밝기까지 같은 면으로 볼까”(크면 가우시안에 가까워짐), <code>sigmaSpace</code> 는 공간 범위입니다. 실무에서는 <code>d = 5~9</code>, <code>sigmaColor = 25~75</code> 부터 시작합니다.' },
          { type: 'code', title: '예제 3: 에지를 가로지르는 한 줄 비교', code: EX_BILATERAL,
            desc: '<code>gradient_clean.png</code> 의 사각형은 (420, 150) 에서 시작하는 150×90 크기입니다. x = 340~352 는 그 왼쪽 에지를 가로지릅니다. 세 줄의 숫자를 비교하세요: <code>GaussianBlur(7×7, σ=2)</code> 는 에지 양쪽 값이 서로 섞여 <b>계단이 완만한 경사</b>가 되지만, <code>BilateralFilter</code> 는 <b>계단 모양이 거의 그대로</b>입니다. 에지 위치로 치수를 재는 검사에서는 이 차이가 곧 측정 오차입니다.',
            expect: 'x=340..352 의 밝기 (에지 통과, y=150)\n원본     : 127 117 140 141 142 196 223 250 240 223 226 223 252\nGaussian : 135 135 138 147 163 183 203 219 229 233 232 232 232\nBilateral: 133 137 136 141 147 189 219 229 232 232 231 231 233' },
          { type: 'code', title: '예제 4: 네 필터를 PSNR 로 한 번에 비교', code: EX_COMPARE,
            desc: '이 영상에서는 <b>Bilateral(35.9) &gt; Median(32.9) &gt; Gaussian(29.6) &gt; Blur(28.2)</b> 순서입니다. 도형과 가는 선이 많아 <b>에지를 지키는 필터가 유리</b>하기 때문입니다. 반면 <code>salt_pepper.png</code> 에서는 Median 43 dB vs Gaussian 25 dB 로 격차가 훨씬 큽니다(실습 1). 즉 <b>PSNR 순위는 영상과 잡음 종류에 따라 달라집니다</b>. PSNR 하나만 보고 필터를 고르면 안 됩니다 — 다음에 할 처리(이진화? 치수 측정? 사람이 보기?)가 기준입니다.',
            expect: '잡음 영상        : 24.67 dB\nBlur(5x5)        : 28.20 dB\nGaussianBlur(5x5): 29.61 dB\nMedianBlur(5)    : 32.91 dB\nBilateral(7,40,7): 35.91 dB' },
          { type: 'callout', kind: 'info', title: '📘 PSNR 과 MSE', html: 'MSE = 두 영상의 차이를 제곱해 평균낸 값, PSNR = 10·log<sub>10</sub>(255² / MSE) [dB]. 두 영상이 완전히 같으면 MSE = 0 → PSNR = ∞ 입니다. 대략 <b>20 dB 이하 = 눈에 잘 보이는 잡음</b>, <b>30 dB 이상 = 꽤 비슷함</b>, <b>40 dB 이상 = 거의 구분 안 됨</b> 정도로 감을 잡으세요. 정답 영상이 없는 현장에서는 PSNR 을 쓸 수 없으므로, 평평한 영역의 <b>표준편차</b>나 최종 검사 결과(개수 · 치수 오차)로 평가합니다.' },
          { type: 'h', text: '언샤프 마스크: 블러를 빼서 선명하게' },
          { type: 'p', html: '흐린 영상을 또렷하게 만드는 표준 방법입니다. 원본에서 블러를 빼면 <b>세부(고주파)</b> 만 남습니다. 이것을 원본에 다시 더하면 세부가 두 배로 강조됩니다.' },
          { type: 'figure', html: FIG_UNSHARP, caption: '그림 7. 언샤프 마스크 = 원본 + k × (원본 − 블러) = AddWeighted(src, 1+k, blur, −k, 0)' },
          { type: 'code', title: '예제 5: 언샤프 마스크 (AddWeighted)', code: EX_UNSHARP,
            desc: '<code>Cv2.AddWeighted(src1, alpha, src2, beta, gamma, dst)</code> 는 <code>dst = alpha·src1 + beta·src2 + gamma</code> 를 계산합니다(포화 처리 포함). 언샤프 마스크는 <code>alpha = 1+k</code>, <code>beta = −k</code> 입니다. k 를 키우면 표준편차(대비)가 커지며 또렷해지지만, 에지에 흰 테두리(오버슈트)가 생기고 잡음까지 강조됩니다. <code>new Size(0, 0)</code> + σ 로 블러 크기를 지정한 것도 눈여겨보세요.',
            expect: 'k = 0.5 : 평균 119.2, 표준편차 39.35 (클수록 대비가 세다)\nk = 1.0 : 평균 119.2, 표준편차 40.07 (클수록 대비가 세다)\nk = 2.0 : 평균 119.2, 표준편차 41.69 (클수록 대비가 세다)\n원본     : 평균 119.2, 표준편차 38.73' },
          { type: 'h', text: '필터 선택 가이드' },
          { type: 'table', head: ['상황', '고를 필터', '이유 · 팁'], rows: [
            ['일반 전처리 (이진화 · 에지 전)', '<code>GaussianBlur(3~5)</code>', '가장 무난한 기본값. 커널을 최소로'],
            ['흰 점 · 검은 점(먼지 · 불량 화소)', '<code>MedianBlur(3 또는 5)</code>', '점이 번지지 않고 사라진다'],
            ['치수 · 서브픽셀 에지 측정', '<code>GaussianBlur(3)</code> 또는 <code>BilateralFilter</code>', '큰 커널은 에지를 밀어 측정 오차가 된다'],
            ['사람이 보는 화면 (미관)', '<code>BilateralFilter</code> + 언샤프', '피부 · 표면이 매끈하면서 윤곽은 선명'],
            ['속도가 최우선 (고속 라인)', '<code>Blur</code> 또는 <code>BoxFilter</code>', '분리 가능 · 적분 영상으로 매우 빠름'],
            ['조명 기울기 · 얼룩', '큰 커널 블러로 배경 추정 후 나누기', '09차시 모폴로지(TopHat/BlackHat) 와 함께'],
            ['흐린 영상 되살리기', '언샤프 마스크 (k 0.5~1.5)', '잡음도 함께 커진다 → 먼저 잡음 제거']
          ], caption: '표 4. 목적별 필터 선택. “다음 단계가 무엇인가”가 기준이다' },
          { type: 'callout', kind: 'warn', title: '브라우저 실습 환경의 제한', html: '<code>Cv2.FastNlMeansDenoising</code>(비국소 평균 잡음 제거)은 OpenCV.js 에 포함되어 있지 않아 이 사이트에서는 실행되지 않습니다. 로컬 PC 의 OpenCvSharp4 에서는 잘 동작하며, 가우시안 잡음 제거 성능이 가장 좋은 편입니다(대신 느립니다). <code>Cv2.Inpaint</code>(손상 영역 복원)도 같습니다.' },
          { type: 'callout', kind: 'wpf', title: 'WPF 에서는', html: '필터 종류를 <code>ComboBox</code> 로, 세기를 <code>Slider</code> 로 두고 결과를 즉시 보여 주는 화면이 16차시의 “이미지 처리 스튜디오” 입니다. 원본 <code>Mat</code> 은 필드에 한 번만 읽어 두고(<code>ImRead</code> 는 느립니다) 결과만 다시 계산하세요. 큰 영상을 매 프레임 <code>BitmapSource</code> 로 바꾸면 UI 가 버벅이므로 <code>WriteableBitmap</code> 재사용을 고려합니다.' },
          { type: 'callout', kind: 'tip', teacher: true, title: '수업 준비 · 오개념 지도', html: '<ul><li><b>준비</b>: <code>salt_pepper.png</code> 와 <code>flange.png</code> 를 결과 창에 나란히 띄워 두면 비교가 쉽습니다. 예제 2 는 윤곽선 개수를 쓰므로 “12차시에서 배울 것”이라고 미리 선을 그어 주세요.</li><li><b>오개념 1</b>: “블러는 화질을 나쁘게 하는 것” → 다음 단계(이진화 · 에지)의 결과를 좋게 하는 <b>전처리</b>임을 강조.</li><li><b>오개념 2</b>: “PSNR 이 높은 필터가 항상 좋다” → 치수 측정에서는 에지 보존이 더 중요. 예제 3의 숫자 줄로 반박.</li><li><b>오개념 3</b>: “MedianBlur 가 만능” → 커널이 크면 가는 선 · 작은 결함까지 지운다. 실습 2 에서 직접 확인시키세요.</li><li><b>평가 루브릭</b>: ① 잡음 종류를 보고 필터를 고를 수 있다(40%) ② 커널 크기 · 인수를 바꿔 결과를 설명한다(30%) ③ PSNR 등 숫자로 근거를 댄다(30%).</li><li>💬 마무리 발문: “필터로 지울 수 없는 잡음은 무엇일까?” — 물체와 크기 · 밝기가 비슷한 잡음. 그때는 모폴로지(09차시)나 형상 특징(12차시)으로 구분한다고 이어 줍니다.</li></ul>' }
        ],
        practice: [
          {
            title: 'MedianBlur 커널 크기와 잡음 제거율', level: 2,
            desc: '<code>images/salt_pepper.png</code> 에 <code>Cv2.MedianBlur</code> 를 커널 3, 5, 7 로 적용하고, 원본 <code>images/flange.png</code> 대비 PSNR 을 각각 출력하세요. 같은 크기의 <code>Cv2.GaussianBlur</code> 결과도 함께 출력해 비교하세요. 어떤 조합이 가장 좋은지 마지막 줄에 쓰세요.',
            hint: '<code>for (int k = 3; k <= 7; k += 2)</code>. Median 은 <code>Cv2.MedianBlur(sp, m, k)</code>, Gaussian 은 <code>Cv2.GaussianBlur(sp, g, new Size(k, k), 0)</code>. PSNR 은 <code>Cv2.PSNR(clean, m)</code>. Median 이 Gaussian 보다 10 dB 이상 높게 나오면 성공입니다.',
            expect: '필터 없음 : 15.54 dB\nksize 3 : Median 43.17 dB / Gaussian 23.43 dB\nksize 5 : Median 43.28 dB / Gaussian 25.54 dB\nksize 7 : Median 41.46 dB / Gaussian 27.10 dB\n가장 좋은 조합 = MedianBlur(5) 43.28 dB',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var clean = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
        Console.WriteLine($"필터 없음 : {Cv2.PSNR(clean, sp):F2} dB");

        for (int k = 3; k <= 7; k += 2)
        {
            using var med = new Mat();
            Cv2.MedianBlur(sp, med, k);
            // TODO: Median 의 PSNR 을 출력하세요

            // TODO: 같은 크기의 GaussianBlur 결과도 출력해 비교하세요
        }
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var clean = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
        using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
        Console.WriteLine($"필터 없음 : {Cv2.PSNR(clean, sp):F2} dB");

        double best = -1;
        int bestK = 0;
        for (int k = 3; k <= 7; k += 2)
        {
            using var med = new Mat();
            Cv2.MedianBlur(sp, med, k);
            double pm = Cv2.PSNR(clean, med);

            using var gau = new Mat();
            Cv2.GaussianBlur(sp, gau, new Size(k, k), 0);
            double pg = Cv2.PSNR(clean, gau);

            Console.WriteLine($"ksize {k} : Median {pm:F2} dB / Gaussian {pg:F2} dB");
            if (pm > best) { best = pm; bestK = k; }
            Cv2.ImShow("median " + k, med);
        }
        Console.WriteLine($"가장 좋은 조합 = MedianBlur({bestK}) {best:F2} dB");
        Cv2.WaitKey(0);
    }
}`
          },
          {
            title: '잡음 제거 → 선명화 파이프라인 만들기', level: 3,
            desc: '<code>images/gradient_noise.png</code> 를 ① <code>BilateralFilter</code> 로 잡음을 줄이고 ② 언샤프 마스크(<code>AddWeighted</code>)로 선명하게 만드는 2단계 파이프라인을 완성하세요. 각 단계의 PSNR(<code>gradient_clean.png</code> 대비)을 출력해서, 선명화를 하면 PSNR 이 오히려 낮아지는 것을 확인하고 왜 그런지 설명(주석)하세요.',
            hint: '① <code>Cv2.BilateralFilter(noisy, bil, 7, 50, 7)</code> ② <code>Cv2.GaussianBlur(bil, blur, new Size(0,0), 2)</code> 로 블러를 만들고 <code>Cv2.AddWeighted(bil, 1.8, blur, -0.8, 0, sharp)</code>. 선명화는 “원본과의 차이”를 키우는 일이므로 PSNR(차이가 작을수록 큰 값)과는 목표가 다릅니다.',
            expect: '1. 원본(잡음)   : 24.67 dB\n2. Bilateral    : 36.20 dB\n3. + 언샤프(k=0.8): 30.92 dB',
            starter: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
        using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
        Console.WriteLine($"1. 원본(잡음)   : {Cv2.PSNR(clean, noisy):F2} dB");

        // TODO: ① BilateralFilter 로 잡음 제거 후 PSNR 출력
        using var bil = new Mat();

        // TODO: ② 언샤프 마스크로 선명화 후 PSNR 출력
        using var sharp = new Mat();

        Cv2.ImShow("noisy", noisy);
        Cv2.WaitKey(0);
    }
}`,
            solution: `using System;
using OpenCvSharp;

class Program
{
    static void Main()
    {
        using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
        using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
        Console.WriteLine($"1. 원본(잡음)   : {Cv2.PSNR(clean, noisy):F2} dB");

        using var bil = new Mat();
        Cv2.BilateralFilter(noisy, bil, 7, 50, 7);
        Console.WriteLine($"2. Bilateral    : {Cv2.PSNR(clean, bil):F2} dB");

        using var blur = new Mat();
        Cv2.GaussianBlur(bil, blur, new Size(0, 0), 2);
        using var sharp = new Mat();
        Cv2.AddWeighted(bil, 1.8, blur, -0.8, 0, sharp);   // k = 0.8
        Console.WriteLine($"3. + 언샤프(k=0.8): {Cv2.PSNR(clean, sharp):F2} dB");

        // 선명화는 원본과의 '차이'를 키우는 처리이므로 PSNR(차이가 작을수록 좋은 지표)은 낮아진다.
        // 눈으로 보기 좋은 것과 원본에 수치적으로 가까운 것은 다른 목표다.
        Cv2.ImShow("noisy", noisy);
        Cv2.ImShow("bilateral", bil);
        Cv2.ImShow("sharpened", sharp);
        Cv2.WaitKey(0);
    }
}`
          }
        ],
        quiz: QUIZ2,
        slides: [
          { layout: 'title', title: '필터링 ② 잡음 제거와 선명화', subtitle: 'MedianBlur · BilateralFilter · PSNR · 언샤프 마스크', notes: '<p>1교시 복습으로 시작: 커널 · 홀수 · 가우시안. 💬 “가우시안 블러로 지워지지 않는 잡음이 있을까요?” 오늘의 답은 “있다 — 소금-후추”. (3분)</p>' },
          { layout: 'image', title: '문제: 이 영상의 구멍을 세어 보자', src: 'images/salt_pepper.png', caption: 'flange.png 에 소금 4% + 후추 4% — 원본 구멍은 7개(중앙 보어 1 + 볼트 6)', notes: '<p>먼저 육안으로 구멍이 몇 개인지 물어봅니다(7개). 💬 “이 영상을 그냥 이진화하면 윤곽선이 몇 개 나올까요?” — 실제로 <b>1만 개가 넘습니다</b>(흰 점 · 검은 점이 모두 윤곽선). 이 교시의 목표를 “윤곽선 8개만 남기기”로 잡아 줍니다. (4분)</p>' },
          { layout: 'diagram', title: '잡음 두 종류', html: FIG_NOISE, caption: '가우시안 = 모두 조금씩 / 임펄스 = 일부만 크게', notes: '<p>그래프의 모양 차이를 강조합니다. 💬 “평균을 내면 어느 쪽이 잘 지워질까요?” — 가우시안은 상쇄되고, 임펄스는 255 가 평균을 끌어올려 번진다. 원인(센서 잡음 vs 불량 화소 · 먼지)도 함께 짚어 줍니다. (5분)</p>' },
          { layout: 'diagram', title: 'MedianBlur: 정렬해서 가운데', html: FIG_MEDIAN, caption: '중간값 62 vs 평균 83 — 튄 값 하나에 끌려가지 않는다', notes: '<p>학생 9명을 세워 키 순으로 줄 세우는 비유가 잘 통합니다. 한 명이 사다리를 타도 가운데 사람 키는 안 바뀐다. “비선형 필터라서 커널 가중치가 없다”는 점도 언급합니다. (5분)</p>' },
          { layout: 'code', title: 'Median vs Gaussian — 구멍 개수', code: `using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
using var med = new Mat();
Cv2.MedianBlur(sp, med, 5);                     // ksize 는 정수 하나!
using var gau = new Mat();
Cv2.GaussianBlur(sp, gau, new Size(5, 5), 0);

using var bin = new Mat();
Cv2.Threshold(med, bin, 0, 255, ThresholdTypes.Binary | ThresholdTypes.Otsu);
Cv2.FindContours(bin, out Point[][] cs, out HierarchyIndex[] hi,
                 RetrievalModes.CComp, ContourApproximationModes.ApproxSimple);
int holes = 0;
for (int i = 0; i < cs.Length; i++)
    if (hi[i].Parent >= 0 && Cv2.ContourArea(cs[i]) > 50) holes++;
Console.WriteLine($"Median 후: 윤곽선 {cs.Length}개, 구멍 {holes}개");

Cv2.ImShow("salt_pepper", sp);
Cv2.ImShow("median 5", med);
Cv2.ImShow("gaussian 5", gau);
Cv2.WaitKey(0);`, points: ['정답은 구멍 7개 (중앙 보어 1 + 볼트 6)', 'Median 은 점이 <b>사라지고</b>, Gaussian 은 <b>번져서 남는다</b>', '<code>MedianBlur</code> 의 ksize 는 <code>new Size</code> 가 아니다'], notes: '<p>결과 창의 세 이미지를 확대해서 Gaussian 쪽에 남은 회색 얼룩을 보여 줍니다. 💬 “필터 없이 이진화하면 윤곽선이 몇 개나 나올까?” — 수천 개. 본문 예제 2 에서 세 경우의 윤곽선 개수를 함께 찍어 비교합니다. 구멍 판정 코드는 12차시 예고로 가볍게 넘어갑니다. (8분)</p>' },
          { layout: 'diagram', title: 'BilateralFilter: 에지 보존', html: FIG_BILATERAL, caption: '거리 × 밝기 차 가중치 → 면만 매끈, 에지는 그대로', notes: '<p>💬 “치수를 재는 검사에서 에지가 흐려지면 어떤 문제가 생길까요?” — 50% 지점이 밀려 측정값이 틀어진다. 인수 세 개(d, sigmaColor, sigmaSpace)의 의미와 “느리다”는 단점을 명확히 말합니다. (5분)</p>' },
          { layout: 'code', title: '에지를 가로지르는 한 줄 비교', code: `using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
using var gau = new Mat();
Cv2.GaussianBlur(noisy, gau, new Size(7, 7), 2);
using var bil = new Mat();
Cv2.BilateralFilter(noisy, bil, 7, 50, 7);

Console.Write("원본     :");
for (int x = 340; x <= 352; x++) Console.Write($" {noisy.At<byte>(150, x),3}");
Console.WriteLine();
Console.Write("Gaussian :");
for (int x = 340; x <= 352; x++) Console.Write($" {gau.At<byte>(150, x),3}");
Console.WriteLine();
Console.Write("Bilateral:");
for (int x = 340; x <= 352; x++) Console.Write($" {bil.At<byte>(150, x),3}");
Console.WriteLine();`, points: ['사각형 왼쪽 에지(x≈345)를 가로지르는 한 줄', 'Gaussian: 계단 → 완만한 경사', 'Bilateral: 계단 모양 유지 + 잡음만 감소'], notes: '<p>숫자 세 줄을 함께 읽으며 어디서 값이 뛰는지 손으로 짚습니다. 이런 “1D 프로파일 읽기”가 캘리퍼 측정의 기본이라고 예고합니다(13차시 · 실전). (6분)</p>' },
          { layout: 'code', title: '네 필터를 PSNR 로 비교', code: `using var clean = Cv2.ImRead("images/gradient_clean.png", ImreadModes.Grayscale);
using var noisy = Cv2.ImRead("images/gradient_noise.png", ImreadModes.Grayscale);
Console.WriteLine($"잡음 영상        : {Cv2.PSNR(clean, noisy):F2} dB");

using var box = new Mat();
Cv2.Blur(noisy, box, new Size(5, 5));
Console.WriteLine($"Blur(5x5)        : {Cv2.PSNR(clean, box):F2} dB");

using var gau = new Mat();
Cv2.GaussianBlur(noisy, gau, new Size(5, 5), 1.5);
Console.WriteLine($"GaussianBlur     : {Cv2.PSNR(clean, gau):F2} dB");

using var med = new Mat();
Cv2.MedianBlur(noisy, med, 5);
Console.WriteLine($"MedianBlur(5)    : {Cv2.PSNR(clean, med):F2} dB");

using var bil = new Mat();
Cv2.BilateralFilter(noisy, bil, 7, 40, 7);
Console.WriteLine($"Bilateral        : {Cv2.PSNR(clean, bil):F2} dB");`, points: ['Blur 28.2 &lt; Gaussian 29.6 &lt; Median 32.9 &lt; <b>Bilateral 35.9</b>', '도형 · 가는 선이 많은 영상 → <b>에지를 지키는 필터가 유리</b>', 'salt_pepper 에서는 Median 43 vs Gaussian 25 — 순위가 영상마다 달라진다'], notes: '<p>표를 함께 읽고 💬 “왜 Bilateral 이 1위일까?” — 이 영상은 도형 · 세로선 · 글자가 많아 에지를 지키는 것이 오차를 줄인다. 이어서 실습 1(salt_pepper)에서는 Median 이 압도한다는 것을 예고해 <b>정답은 영상마다 다르다</b>를 못 박습니다. (6분)</p>' },
          { layout: 'diagram', title: '언샤프 마스크', html: FIG_UNSHARP, caption: '원본 + k × (원본 − 블러) = AddWeighted(src, 1+k, blur, −k, 0)', notes: '<p>“빼서 남은 것이 세부”라는 직관을 강조합니다. 💬 “왜 이름이 언샤프(unsharp) 마스크일까?” — 흐린(unsharp) 영상을 마스크로 쓰기 때문. 인쇄 제판 시절의 용어입니다. (4분)</p>' },
          { layout: 'code', title: '언샤프 마스크 (AddWeighted)', code: `using var img = Cv2.ImRead("images/sample_color.png", ImreadModes.Color);
using var blur = new Mat();
Cv2.GaussianBlur(img, blur, new Size(0, 0), 3);   // (0,0) → sigma 로 결정

double[] ks = new double[] { 0.5, 1.0, 2.0 };
foreach (double k in ks)
{
    using var sharp = new Mat();
    Cv2.AddWeighted(img, 1 + k, blur, -k, 0, sharp);
    using var gray = new Mat();
    Cv2.CvtColor(sharp, gray, ColorConversionCodes.BGR2GRAY);
    Cv2.MeanStdDev(gray, out Scalar m, out Scalar sd);
    Console.WriteLine($"k={k:F1} 표준편차 {sd.Val0:F2}");
    Cv2.ImShow("unsharp k=" + k, sharp);
}
Cv2.WaitKey(0);`, points: ['<code>dst = alpha·src1 + beta·src2 + gamma</code>', 'k ↑ → 대비(표준편차) ↑, 오버슈트 · 잡음도 ↑', '보통 k = 0.5 ~ 1.5'], notes: '<p>k=2.0 결과를 확대해 에지의 흰 테두리(오버슈트)를 찾게 합니다. 💬 “잡음이 있는 영상을 먼저 선명하게 하면?” — 잡음이 더 커진다 → 순서는 <b>잡음 제거 → 선명화</b>. (6분)</p>' },
          { layout: 'table', title: '필터 선택 가이드', head: ['상황', '고를 필터'], rows: [
            ['일반 전처리 (이진화 · 에지 전)', '<code>GaussianBlur(3~5)</code>'],
            ['흰 점 · 검은 점 (먼지 · 불량 화소)', '<code>MedianBlur(3 또는 5)</code>'],
            ['치수 · 서브픽셀 에지 측정', '<code>GaussianBlur(3)</code> / <code>BilateralFilter</code>'],
            ['사람이 보는 화면', '<code>BilateralFilter</code> + 언샤프'],
            ['속도 최우선', '<code>Blur</code> · <code>BoxFilter</code>'],
            ['조명 기울기 · 얼룩', '큰 커널 배경 추정 · 모폴로지 (09차시)']
          ], notes: '<p>표를 노트에 옮겨 적게 합니다. 기준은 “<b>다음 단계가 무엇인가</b>”. 09차시 모폴로지로 자연스럽게 연결합니다. (4분)</p>' },
          { layout: 'quiz', title: '확인 퀴즈', q: '소금-후추(임펄스) 잡음에 가장 알맞은 필터는?', options: ['<code>Cv2.Blur</code>', '<code>Cv2.GaussianBlur</code>', '<code>Cv2.MedianBlur</code>', '<code>Cv2.BoxFilter</code>'], answer: 2, explain: '평균 계열은 튄 값에 끌려가 잡음이 번집니다. 중간값은 정렬해서 가운데를 고르므로 튄 값이 버려집니다.', notes: '<p>정답 3번. 틀린 학생에게는 그림 5 의 정렬 줄을 다시 보여 줍니다. (2분)</p>' },
          { layout: 'practice', title: '실습: Median 커널 크기 찾기', desc: '<p><code>salt_pepper.png</code> 에 Median 3 · 5 · 7 과 같은 크기 Gaussian 을 적용하고 <code>flange.png</code> 대비 PSNR 을 비교하세요.</p><ul><li>Median 이 Gaussian 보다 10 dB 이상 높으면 성공</li><li>커널을 더 키우면 왜 다시 나빠지는지 설명</li></ul>', starter: `using var clean = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
Console.WriteLine($"필터 없음 : {Cv2.PSNR(clean, sp):F2} dB");

for (int k = 3; k <= 7; k += 2)
{
    using var med = new Mat();
    Cv2.MedianBlur(sp, med, k);
    // TODO: Median · Gaussian 의 PSNR 을 출력하세요
}`, solution: `using var clean = Cv2.ImRead("images/flange.png", ImreadModes.Grayscale);
using var sp = Cv2.ImRead("images/salt_pepper.png", ImreadModes.Grayscale);
Console.WriteLine($"필터 없음 : {Cv2.PSNR(clean, sp):F2} dB");

for (int k = 3; k <= 7; k += 2)
{
    using var med = new Mat();
    Cv2.MedianBlur(sp, med, k);
    using var gau = new Mat();
    Cv2.GaussianBlur(sp, gau, new Size(k, k), 0);
    Console.WriteLine($"ksize {k} : Median {Cv2.PSNR(clean, med):F2} dB" +
                      $" / Gaussian {Cv2.PSNR(clean, gau):F2} dB");
    Cv2.ImShow("median " + k, med);
}
Cv2.WaitKey(0);`, notes: '<p>Median 5 가 가장 좋게 나옵니다(잡음 8% 는 3×3 으로는 부족). 7 이상은 플랜지의 나사산 · 가는 구조를 지우기 시작해 다시 나빠집니다. 여기서 “커널은 잡음을 이길 만큼만 크게”라는 원칙을 정리합니다. (8분)</p>' },
          { layout: 'summary', title: '정리', bullets: ['잡음 종류를 먼저 본다: 가우시안(전체 자글자글) vs 임펄스(점)', '<b>임펄스 → MedianBlur</b>, 가우시안 → GaussianBlur · Blur', '<b>BilateralFilter</b> = 거리 × 밝기 차 → 에지 보존 (느림)', '<b>PSNR</b>(dB) 로 비교하되, 목적이 치수 측정이면 에지 보존이 우선', '언샤프 마스크 = <code>AddWeighted(src, 1+k, blur, −k, 0)</code> — 순서는 잡음 제거 → 선명화', '다음 차시: 모폴로지 — <b>모양</b>으로 지우고 메우고 이어 붙인다'], notes: '<p>오늘의 한 줄: “필터는 다음 단계를 위해 고른다.” 09차시 예고 — 이진 영상에서 남은 점과 구멍을 <b>모양</b>으로 처리하는 방법(Open · Close)을 배운다고 예고하면 자연스럽게 이어집니다. (2분)</p>' }
        ]
      }
    ]
  });
})();
