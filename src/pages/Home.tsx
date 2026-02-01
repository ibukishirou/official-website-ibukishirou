import { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import '../styles/home.css';

interface Work {
  title: string;
  category: string;
  link: string;
  tags: string[];
  featured: boolean;
}

interface Links {
  [key: string]: string;
}

export default function Home() {
  const [featuredWorks, setFeaturedWorks] = useState<Work[]>([]);
  const [links, setLinks] = useState<Links>({});
  const [isPausedByUser, setIsPausedByUser] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // データ読み込み
    const loadData = async () => {
      try {
        const [worksRes, linksRes] = await Promise.all([
          fetch('/data/works.json'),
          fetch('/data/links.json')
        ]);
        const worksData: Work[] = await worksRes.json();
        const linksData: Links = await linksRes.json();
        
        setFeaturedWorks(worksData.filter(item => item.featured));
        setLinks(linksData);
      } catch (error) {
        console.error('データの読み込みに失敗しました:', error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    // 自動スクロール機能
    const container = containerRef.current;
    if (!container || featuredWorks.length === 0) return;

    let isWaitingAtEnd = false;
    let isReturningToStart = false;
    const scrollSpeed = 0.5;
    let animationFrameId: number;

    const scroll = () => {
      if (!container) return;

      if (!isPausedByUser && !isWaitingAtEnd && !isReturningToStart) {
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        container.scrollLeft += scrollSpeed;

        if (container.scrollLeft >= maxScrollLeft - 1) {
          isWaitingAtEnd = true;
          setTimeout(() => {
            isWaitingAtEnd = false;
            isReturningToStart = true;
            container.style.scrollBehavior = 'smooth';
            container.scrollLeft = 0;
            setTimeout(() => {
              container.style.scrollBehavior = 'auto';
              isReturningToStart = false;
            }, 800);
          }, 3000);
        }
      }

      animationFrameId = requestAnimationFrame(scroll);
    };

    setTimeout(() => {
      animationFrameId = requestAnimationFrame(scroll);
    }, 100);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [featuredWorks, isPausedByUser]);

  const extractYouTubeVideoId = (url: string): string => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/))([^&?\s]+)/);
    return match ? match[1] : '';
  };

  const snsConfig = [
    { key: 'youtube', name: 'YouTube', icon: 'ri-youtube-line' },
    { key: 'x_main', name: 'X (Twitter)', icon: 'ri-twitter-x-line' },
    { key: 'bluesky', name: 'Bluesky', icon: 'ri-home-smile-line' },
    { key: 'tiktok', name: 'TikTok', icon: 'ri-music-2-line' },
    { key: 'instagram', name: 'Instagram', icon: 'ri-instagram-line' },
    { key: 'marshmallow', name: 'Marshmallow', icon: 'ri-chat-smile-2-line' },
    { key: 'booth', name: 'BOOTH', icon: 'ri-shopping-bag-line' },
    { key: 'wishlist', name: 'Wishlist', icon: 'ri-gift-line' },
  ];

  return (
    <>
      <Helmet>
        <title>伊吹しろう Official Website - 気づけば君の毎日に、俺がいる</title>
        <meta name="description" content="VTuber 伊吹しろう 公式サイト。歌・トーク・ゲームを中心に活動するエンターテイナー。最新情報、作品一覧、ガイドライン等はこちらから。気づけば君の毎日に、俺がいる。" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="伊吹しろう Official Website - 気づけば君の毎日に、俺がいる" />
        <meta property="og:description" content="VTuber 伊吹しろう 公式サイト。歌・トーク・ゲームを中心に活動するエンターテイナー。" />
        <meta property="og:url" content="https://ulric.jp/" />
        <meta property="og:image" content="https://ulric.jp/assets/img/ogp.webp" />
      </Helmet>

      {/* ヒーローセクション */}
      <section className="hero">
        <div className="hero-video-wrapper">
          <iframe
            id="hero-video"
            src="https://www.youtube.com/embed/H_hsFNOfKNI?autoplay=1&mute=1&loop=1&playlist=H_hsFNOfKNI&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
            className="hero-bg-video"
          />
        </div>
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* キャッチフレーズセクション */}
      <section id="catchphrase">
        <h2 className="section-title">Virtual Talent</h2>
        <p className="catchphrase-subtitle">伊吹しろう / Ibuki Shirou</p>
        <p className="catchphrase-company">個人事務所ULRIC</p>
        <p className="catchphrase-description">配信・企画・グッズなど幅広く展開。</p>
        <p className="catchphrase-text">
          <span className="catchphrase-line1">気づけば君の</span>
          <span className="catchphrase-line2">毎日に、</span>
          <span className="catchphrase-line3">俺がいる。</span>
        </p>
      </section>

      {/* 自己紹介動画セクション */}
      <section id="introduction">
        <h2 className="section-title">Introduction</h2>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/ubOOb-J1Jeg"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </section>

      {/* 代表作セクション */}
      <section id="featured-works">
        <h2 className="section-title">Songs</h2>
        <div 
          className="card-grid" 
          id="featured-works-container"
          ref={containerRef}
          onMouseDown={() => setIsPausedByUser(true)}
          onMouseUp={() => setIsPausedByUser(false)}
          onMouseEnter={() => setIsPausedByUser(true)}
          onMouseLeave={() => setIsPausedByUser(false)}
          onTouchStart={() => setIsPausedByUser(true)}
          onTouchEnd={() => setIsPausedByUser(false)}
        >
          {featuredWorks.map((work, index) => {
            const videoId = extractYouTubeVideoId(work.link);
            const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            return (
              <a
                key={index}
                href={work.link}
                target="_blank"
                rel="noopener noreferrer"
                className="featured-work-item"
              >
                <div className="thumbnail-link">
                  <img
                    src={thumbnailUrl}
                    alt={work.title}
                    className="featured-thumbnail"
                    onError={(e) => {
                      e.currentTarget.src = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
                    }}
                  />
                </div>
                <div className="card-content">
                  <h3 className="card-title">{work.title}</h3>
                  <div className="card-tags">
                    {work.tags.map((tag, i) => (
                      <span key={i} className="tag">{tag}</span>
                    ))}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </section>

      {/* SNSリンク */}
      <section id="social">
        <h2 className="section-title">Social Links</h2>
        <div className="sns-links" id="sns-links-container">
          {snsConfig.map((sns) => {
            if (!links[sns.key]) return null;
            return (
              <a
                key={sns.key}
                href={links[sns.key]}
                target="_blank"
                rel="noopener noreferrer"
                className="sns-link"
              >
                <i className={sns.icon}></i>
                <span>{sns.name}</span>
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}
