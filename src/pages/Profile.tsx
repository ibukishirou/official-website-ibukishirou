import { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import '../styles/profile.css';

interface Links {
  [key: string]: string;
}

export default function Profile() {
  const [links, setLinks] = useState<Links>({});
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [activeVoice, setActiveVoice] = useState<string | null>(null);

  useEffect(() => {
    // SNSリンクの読み込み
    const loadLinks = async () => {
      try {
        const response = await fetch('/data/links.json');
        const linksData: Links = await response.json();
        setLinks(linksData);
      } catch (error) {
        console.error('SNSリンクの読み込みに失敗しました:', error);
      }
    };
    loadLinks();
  }, []);

  const playVoice = (voiceNum: string) => {
    const voicePaths: { [key: string]: string } = {
      '1': '/assets/audio/voice01.mp3',
      '2': '/assets/audio/voice02.mp3',
      '3': '/assets/audio/voice03.mp3'
    };

    const voicePath = voicePaths[voiceNum];

    // 既に再生中の音声があれば停止
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
      
      // 同じボタンをクリックした場合は停止のみ
      if (currentAudio.src.includes(voicePath)) {
        setCurrentAudio(null);
        setActiveVoice(null);
        return;
      }
    }

    // 新しい音声を再生
    const audio = new Audio(voicePath);
    setCurrentAudio(audio);
    setActiveVoice(voiceNum);

    audio.play().catch(error => {
      console.error('ボイスの再生に失敗しました:', error);
      setActiveVoice(null);
    });

    // 再生終了時にactiveクラスを削除
    audio.addEventListener('ended', () => {
      setActiveVoice(null);
      setCurrentAudio(null);
    });
  };

  const snsConfig = [
    { key: 'youtube', name: 'YouTube', icon: 'ri-youtube-line' },
    { key: 'x_main', name: 'X', icon: 'ri-twitter-x-line' }
  ];

  return (
    <>
      <Helmet>
        <title>Profile - 伊吹しろう Official Website</title>
        <meta name="description" content="VTuber 伊吹しろうのプロフィール。誕生日、デビュー日、活動内容などを掲載。個人事務所ULRIC所属、歌とトークで君を虜にするVTuber。" />
        <meta property="og:type" content="article" />
        <meta property="og:title" content="Profile - 伊吹しろう Official Website" />
        <meta property="og:description" content="VTuber 伊吹しろうのプロフィール。誕生日、デビュー日、活動内容などを掲載。" />
        <meta property="og:url" content="https://ulric.jp/profile" />
        <meta property="og:image" content="https://ulric.jp/assets/img/ogp.webp" />
      </Helmet>

      <section style={{ paddingTop: '2rem' }}>
        <h2 className="section-title">Profile</h2>
        
        <div className="profile-container">
          <div className="profile-image-wrapper">
            <img src="/assets/img/profile_full.webp" alt="伊吹しろう 全身立ち絵" className="profile-image" />
            <a href="https://drive.google.com/file/d/1ae1Px7DxD8Km_t4aicdzGWOGPczOElV4/view" target="_blank" rel="noopener noreferrer" className="sanmenzu-link">
              <img src="/assets/img/sanmenzu.webp" alt="伊吹しろう 三面図" className="sanmenzu-image" />
            </a>
            <p className="sanmenzu-note">クリックで拡大表示ができます</p>
          </div>
          
          <div className="profile-info">
            {/* 伊吹しろうセクション */}
            <div className="profile-section-group">
              <h1 className="profile-name">
                伊吹しろう <span className="profile-name-en" style={{ color: 'var(--color-text)', fontSize: '0.8em', fontWeight: 400 }}>Ibuki Shirou</span>
              </h1>
              <p style={{ fontFamily: 'var(--font-secondary)', color: 'var(--color-secondary)', marginBottom: '1rem', lineHeight: 1.8, fontWeight: 700, fontSize: '1.15rem' }}>
                歌とトークで君を虜にするVTuber。<br />
                一瞬を楽しむだけじゃない、君の記憶に深く刻まれる存在へ。
              </p>
              <p style={{ fontFamily: 'var(--font-secondary)', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.8 }}>
                毎日朝から昼にかけて雑談メインで配信中！<br />
                長時間なのに全く途切れない喋りで、みんなへ元気をお届け。<br />
                落ち着いた声とトーク、歌の上手さも魅力。<br />
                荒らしやマナー悪い奴は即粛清。みんなが安心して過ごせる空間を大事にしてます！
              </p>
              <p style={{ fontFamily: 'var(--font-secondary)', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.8 }}>
                定期的な歌ってみたリリースやグッズ発表は企業並みの展開力。<br />
                メンバーシップ限定の月末決算配信は赤裸々すぎて企業じゃできないレベル。
              </p>
              <p style={{ fontFamily: 'var(--font-secondary)', color: 'var(--color-text)', marginBottom: '1rem', lineHeight: 1.8, fontWeight: 600, fontSize: '1.05rem' }}>
                夢はパシフィコ横浜で大型イベント！まずは目指せチャンネル登録1万人！
              </p>
              <p style={{ fontFamily: 'var(--font-secondary)', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.8 }}>
                「気づいたら毎朝配信来てる」「伊吹しろうじゃないと物足りない」
              </p>
              <p style={{ fontFamily: 'var(--font-secondary)', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.8 }}>
                本当にそうか確かめにきてね！配信で待ってるよ！
              </p>
              
              {/* Voice Section & Social Links Container */}
              <div className="profile-links-container">
                {/* Voice Player */}
                <div className="profile-voice-section">
                  {['1', '2', '3'].map((num) => (
                    <button
                      key={num}
                      className={`voice-button ${activeVoice === num ? 'active' : ''}`}
                      data-voice={num}
                      aria-label={`ボイス${num}を再生`}
                      onClick={() => playVoice(num)}
                    >
                      <i className="ri-volume-up-line"></i>
                    </button>
                  ))}
                </div>
                
                {/* Social Links */}
                <div className="profile-social-links" id="profile-social-links">
                  {snsConfig.map((sns) => {
                    if (!links[sns.key]) return null;
                    return (
                      <a
                        key={sns.key}
                        href={links[sns.key]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="profile-social-link"
                      >
                        <div className="profile-social-icon">
                          <i className={sns.icon}></i>
                        </div>
                        <div className="profile-social-name">{sns.name}</div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* 基本情報グループ */}
            <div className="profile-section-group">
              <h3 className="profile-section-title">基本情報</h3>
              <ul className="profile-details">
                <li>
                  <span className="profile-label">誕生日</span>
                  <span className="profile-value">3月22日</span>
                </li>
                <li>
                  <span className="profile-label">デビュー日</span>
                  <span className="profile-value">2025年9月22日</span>
                </li>
                <li>
                  <span className="profile-label">身長</span>
                  <span className="profile-value">178cm(耳のてっぺんまで)</span>
                </li>
                <li>
                  <span className="profile-label">好きなもの</span>
                  <span className="profile-value">おしゃべり / ラップ / 寿司</span>
                </li>
                <li>
                  <span className="profile-label">嫌いなもの</span>
                  <span className="profile-value">俺のことが嫌いな奴の一切 / ビーズ・砂利 / 虫</span>
                </li>
                <li>
                  <span className="profile-label">活動内容</span>
                  <span className="profile-value">雑談 / ゲーム / 歌ってみた</span>
                </li>
                <li>
                  <span className="profile-label">得意ジャンル</span>
                  <span className="profile-value">ポケモン / アクション / TRPG・マダミス</span>
                </li>
                <li>
                  <span className="profile-label">ファンマーク</span>
                  <span className="profile-value">🐺🍁</span>
                </li>
                <li>
                  <span className="profile-label">ファンネーム</span>
                  <span className="profile-value">ウルメイト</span>
                </li>
              </ul>
            </div>

            {/* ハッシュタググループ */}
            <div className="profile-section-group">
              <h3 className="profile-section-title">ハッシュタグ</h3>
              <ul className="profile-details">
                <li>
                  <span className="profile-label">配信の感想</span>
                  <span className="profile-value">#いぶしろライブ</span>
                </li>
                <li>
                  <span className="profile-label">ファンアート</span>
                  <span className="profile-value">#しろうの画廊</span>
                </li>
                <li>
                  <span className="profile-label">なんでもOK</span>
                  <span className="profile-value">#伊吹しろう</span>
                </li>
              </ul>
            </div>

            {/* クリエイター情報グループ */}
            <div className="profile-section-group">
              <h3 className="profile-section-title">クリエイター</h3>
              <ul className="profile-details">
                <li>
                  <span className="profile-label">キャラクター</span>
                  <span className="profile-value">
                    <a href="https://x.com/m_moru" target="_blank" rel="noopener noreferrer" className="profile-link">モル様</a>
                  </span>
                </li>
                <li>
                  <span className="profile-label">モデリング</span>
                  <span className="profile-value">
                    <a href="https://x.com/pwpwpom" target="_blank" rel="noopener noreferrer" className="profile-link">ぷわわ様</a>
                  </span>
                </li>
                <li>
                  <span className="profile-label">ロゴ</span>
                  <span className="profile-value">
                    <a href="https://x.com/unis_ctrle" target="_blank" rel="noopener noreferrer" className="profile-link">ゆに様</a>
                  </span>
                </li>
                <li>
                  <span className="profile-label">バッチ・スタンプ</span>
                  <span className="profile-value">
                    <a href="https://komainui.jimdofree.com/" target="_blank" rel="noopener noreferrer" className="profile-link">狛戌ぬい様</a>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
