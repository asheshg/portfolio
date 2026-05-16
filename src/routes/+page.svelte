<script>
  import { onMount } from 'svelte';

  const storyDuration = 6000;
  const instagramUrl = 'https://www.instagram.com/asheshgohil';

  const chapters = [
    {
      label: 'Introduction',
      stories: [
        { id: 'intro-1', src: '/stories/intro-1.png', width: 375, height: 758, alt: 'Introduction story 1' },
        { id: 'intro-2', src: '/stories/intro-2.png', width: 375, height: 758, alt: 'Introduction story 2' },
        { id: 'intro-3', src: '/stories/intro-3.png', width: 375, height: 758, alt: 'Introduction story 3' }
      ]
    },
    {
      label: 'Work - v0',
      stories: [
        { id: 'work-v0-1', src: '/stories/work-v0-1.png', width: 375, height: 758, alt: 'Work v0 story 1' },
        { id: 'work-v0-2', src: '/stories/work-v0-2.png', width: 375, height: 758, alt: 'Work v0 story 2' },
        { id: 'work-v0-3', src: '/stories/work-v0-3.png', width: 375, height: 758, alt: 'Work v0 story 3' },
        { id: 'work-v0-4', src: '/stories/work-v0-4.png', width: 375, height: 758, alt: 'Work v0 story 4' }
      ]
    },
    {
      label: 'Figma',
      stories: [{ id: 'figma-1', src: '/stories/figma-1.png', width: 480, height: 758, alt: 'Figma story' }]
    },
    {
      label: 'Me',
      stories: [
        { id: 'me-1', src: '/stories/me-1.png', width: 375, height: 758, alt: 'Me story 1' },
        { id: 'me-2', src: '/stories/me-2.png', width: 375, height: 758, alt: 'Me story 2' }
      ]
    },
    {
      label: 'Contact',
      stories: [{ id: 'contact-1', src: '/stories/contact-1.png', width: 375, height: 758, alt: 'Contact story' }]
    }
  ];

  let chapterIndex = 0;
  let storyIndex = 0;
  let direction = 1;
  let pointerStartX = 0;
  let pointerStartY = 0;
  let pointerFrameWidth = 375;
  let gestureGap = 0;
  let held = false;
  let paginationKey = 0;
  let autoplayTimer;
  let mounted = false;
  let activeStories = chapters.map(() => 0);

  $: chapter = chapters[chapterIndex];
  $: story = chapter.stories[storyIndex];
  $: aspect = `${story.width} / ${story.height}`;
  $: previousChapterIndex = chapterIndex > 0 ? chapterIndex - 1 : null;
  $: nextChapterIndex = chapterIndex < chapters.length - 1 ? chapterIndex + 1 : null;
  $: visibleChapters = [
    previousChapterIndex !== null ? { index: previousChapterIndex, position: 'previous' } : null,
    { index: chapterIndex, position: 'current' },
    nextChapterIndex !== null ? { index: nextChapterIndex, position: 'next' } : null
  ].filter(Boolean);
  $: cubeOffset = held
    ? Math.max(Math.min(gestureGap * 1.1, pointerFrameWidth), -pointerFrameWidth)
    : 0;
  $: paginationStyle = `--story-duration:${storyDuration}ms;`;

  function clampStory(nextChapter, nextStory) {
    const safeChapter = Math.max(0, Math.min(chapters.length - 1, nextChapter));
    const safeStory = Math.max(0, Math.min(chapters[safeChapter].stories.length - 1, nextStory));
    return [safeChapter, safeStory];
  }

  function setStory(nextChapter, nextStory, nextDirection = 1) {
    const [safeChapter, safeStory] = clampStory(nextChapter, nextStory);

    chapterIndex = safeChapter;
    storyIndex = safeStory;
    direction = nextDirection;
    paginationKey += 1;
    activeStories[safeChapter] = safeStory;
    activeStories = [...activeStories];
    window.history.replaceState(null, '', `#/${chapterIndex}/${storyIndex}`);
    if (mounted) scheduleAutoplay();
  }

  function nextStory() {
    if (storyIndex < chapter.stories.length - 1) setStory(chapterIndex, storyIndex + 1, 1);
  }

  function previousStory() {
    if (storyIndex > 0) setStory(chapterIndex, storyIndex - 1, -1);
  }

  function nextSection() {
    if (chapterIndex < chapters.length - 1) {
      setStory(chapterIndex + 1, activeStories[chapterIndex + 1], 1);
    }
  }

  function previousSection() {
    if (chapterIndex > 0) {
      setStory(chapterIndex - 1, activeStories[chapterIndex - 1], -1);
    }
  }

  function autoplayNext() {
    if (storyIndex < chapter.stories.length - 1) nextStory();
    else nextSection();
  }

  function goToChapter(index) {
    setStory(index, activeStories[index], index >= chapterIndex ? 1 : -1);
  }

  function scheduleAutoplay() {
    clearTimeout(autoplayTimer);
    autoplayTimer = setTimeout(autoplayNext, storyDuration);
  }

  function syncFromHash() {
    const [, rawChapter, rawStory] = window.location.hash.match(/^#\/(\d+)\/(\d+)$/) || [];
    if (rawChapter !== undefined && rawStory !== undefined) {
      const previousChapter = chapterIndex;
      const [safeChapter, safeStory] = clampStory(Number(rawChapter), Number(rawStory));
      chapterIndex = safeChapter;
      storyIndex = safeStory;
      direction = safeChapter >= previousChapter ? 1 : -1;
      paginationKey += 1;
      activeStories[safeChapter] = safeStory;
      activeStories = [...activeStories];
    } else {
      window.history.replaceState(null, '', '#/0/0');
    }
    scheduleAutoplay();
  }

  function handleKeydown(event) {
    if (event.key === 'ArrowRight' || event.key === ' ') nextStory();
    if (event.key === 'ArrowLeft') previousStory();
    if (event.key === 'ArrowUp') previousSection();
    if (event.key === 'ArrowDown') nextSection();
  }

  function handlePointerDown(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
    pointerFrameWidth = bounds.width;
    gestureGap = 0;
    held = true;
    clearTimeout(autoplayTimer);
    event.currentTarget.setPointerCapture?.(event.pointerId);
  }

  function handlePointerUp(event) {
    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;
    held = false;
    gestureGap = deltaX;
    event.currentTarget.releasePointerCapture?.(event.pointerId);

    if (Math.abs(deltaX) > 56 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) nextSection();
      if (deltaX > 0) previousSection();
      gestureGap = 0;
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const midpoint = bounds.left + bounds.width / 2;
    if (event.clientX < midpoint) previousStory();
    else nextStory();
    gestureGap = 0;
  }

  function handlePointerMove(event) {
    if (!held) return;
    gestureGap = event.clientX - pointerStartX;
  }

  function handlePointerCancel(event) {
    held = false;
    gestureGap = 0;
    scheduleAutoplay();
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  }

  function chapterStory(chapterNumber) {
    return chapters[chapterNumber].stories[activeStories[chapterNumber]];
  }

  function chapterStoryIndex(chapterNumber) {
    return activeStories[chapterNumber];
  }

  function panelClass(position) {
    if (position === 'current') return 'current-panel';
    if (position === 'next') return 'next-panel';
    if (position === 'previous') return 'previous-panel';
    return '';
  }

  function panelStyle(position) {
    if (!held) {
      return position === 'previous'
        ? 'transform-origin: right center;'
        : position === 'next'
          ? 'transform-origin: left center;'
          : `transform-origin: ${direction > 0 ? 'right' : 'left'} center;`;
    }

    const baseTranslate = position === 'previous' ? -100 : position === 'next' ? 100 : 0;
    const baseRotate = position === 'previous' ? -90 : position === 'next' ? 90 : 0;
    const dragRotate = Math.min(Math.max(gestureGap / 4.2, -90), 90);
    const origin =
      position === 'previous'
        ? 'right center'
        : position === 'next'
          ? 'left center'
          : gestureGap < 0
            ? 'right center'
            : 'left center';

    return `transform: translateX(${baseTranslate}%) rotateY(${dragRotate + baseRotate}deg); transform-origin: ${origin}; transition: transform 0s;`;
  }

  onMount(() => {
    mounted = true;
    syncFromHash();

    window.addEventListener('hashchange', syncFromHash);
    window.addEventListener('keydown', handleKeydown);
    return () => {
      mounted = false;
      clearTimeout(autoplayTimer);
      window.removeEventListener('hashchange', syncFromHash);
      window.removeEventListener('keydown', handleKeydown);
    };
  });
</script>

<svelte:head>
  <title>Ashesh Gohil Portfolio</title>
</svelte:head>

<main class="site-shell" style:--direction={direction}>
  <nav class="chapter-nav" aria-label="Portfolio sections">
    {#each chapters as item, index}
      <button
        class:active={index === chapterIndex}
        type="button"
        aria-current={index === chapterIndex ? 'page' : undefined}
        on:click={() => goToChapter(index)}
      >
        {item.label}
      </button>
    {/each}
  </nav>

  <section class="story-stage" aria-label={`${chapter.label} story ${storyIndex + 1}`}>
    <div
      class="story-phone"
      class:held
      role="group"
      aria-label="Story viewer"
      style:aspect-ratio={aspect}
      on:pointerdown={handlePointerDown}
      on:pointermove={handlePointerMove}
      on:pointerup={handlePointerUp}
      on:pointercancel={handlePointerCancel}
    >
      <div
        class="story-cube"
        style={`transform: translateX(${cubeOffset}px); ${held ? 'transition: transform 0s;' : 'transition: transform .5s ease;'}`}
      >
        {#each visibleChapters as visibleChapter (visibleChapter.index)}
          {@const visibleStory = chapterStory(visibleChapter.index)}
          <div
            class={`chapter-panel ${panelClass(visibleChapter.position)}`}
            style={panelStyle(visibleChapter.position)}
          >
            <article class={`editable-story story-${visibleStory.id}`} aria-label={visibleStory.alt}>
              <img class="pixel-base" src={visibleStory.src} alt="" aria-hidden="true" draggable="false" />

              <div class="pagination" aria-hidden="true">
                {#key paginationKey}
                  <div class="pagination-row" style={paginationStyle}>
                    {#each chapters[visibleChapter.index].stories as item, index}
                      <span
                        class:complete={index < chapterStoryIndex(visibleChapter.index)}
                        class:current={visibleChapter.position === 'current' && index === chapterStoryIndex(visibleChapter.index)}
                      ></span>
                    {/each}
                  </div>
                {/key}
              </div>

              <a class="profile-link" href={instagramUrl} target="_blank" rel="noreferrer">
                <span class="avatar"></span>
                <span>asheshgohil</span>
              </a>

              {#if visibleStory.id === 'intro-1'}
                <div class="photo-figure person-photo"></div>
                <h1 class="sticker sticker-xl intro-hello">Hi! 👋<br />I am Ashesh.</h1>
                <p class="sticker intro-site">This is my website. It’s like IG stories.</p>
                <p class="sticker intro-help">Tap to navigate, or swipe to skip sections.</p>
              {:else if visibleStory.id === 'intro-2'}
                <div class="photo-figure panel-photo"></div>
                <h2 class="sticker sticker-lg intro-role">I am a UI/UX designer or<br />a digital product designer.</h2>
                <p class="sticker intro-work">It mostly involves designing and redesigning websites and apps. Sometimes with AI.</p>
              {:else if visibleStory.id === 'intro-3'}
                <div class="photo-figure office-photo"></div>
                <h2 class="sticker sticker-lg intro-current">I currently work at <u>pwc india.</u></h2>
                <p class="sticker intro-before">Before that, I worked at</p>
                <p class="tag tag-one">@yellowslice</p>
                <p class="tag tag-two">@wayfair</p>
                <p class="tag tag-three">@ransmeier</p>
                <p class="tag tag-four">@risd1877</p>
              {:else if visibleStory.id === 'work-v0-1'}
                <h2 class="sticker sticker-lg work-bank">I recently redesigned 4<br />major modules for a CRM<br />of a leading Indian bank.</h2>
                <div class="locked-card bank-one"><span>⌘</span></div>
                <div class="locked-card bank-two"><span>⌘</span></div>
                <div class="locked-card bank-three"><span>⌘</span></div>
                <p class="sticker nda">Covered by NDA 😬</p>
              {:else if visibleStory.id === 'work-v0-2'}
                <p class="sticker work-copy work-yellowslice">At <u>yellowslice</u>, I redesigned the <u>mutualfundssahihai website</u>.</p>
                <div class="browser-card mutual-card">Mutual Funds Sahi Hai</div>
                <p class="sticker work-copy work-erp">And an <u>ERP for construction management teams.</u></p>
                <div class="phone-row"><span></span><span></span><span></span></div>
                <p class="sticker work-copy work-govt">I also designed a <u>govt visitor management app</u>.</p>
                <div class="app-screens"><span></span><span></span></div>
              {:else if visibleStory.id === 'work-v0-3'}
                <p class="sticker work-copy work-modern">And <u>allmodern's store locations page</u> for their first ever physical retail store at wayfair.</p>
                <div class="browser-card store-card">STORE LOCATIONS</div>
                <p class="sticker work-copy work-tool">Along with streamlining an internal tool to just one click.</p>
                <div class="browser-card tool-card">Internal launch tool</div>
              {:else if visibleStory.id === 'work-v0-4'}
                <div class="video-card">Hackathon<br /><span>video interview</span></div>
                <p class="sticker work-copy pitch">Also designed (& pitched) a pitch deck to help an NGO win a grant.</p>
                <p class="sticker watch">You can watch it <u>here</u></p>
                <div class="paper paper-one"></div>
                <div class="paper journal">RHODE ISLAND<br />MEDICAL JOURNAL</div>
                <p class="sticker journal-note">Which also got featured in<br /><u>Rhode Island Medical Journal</u></p>
              {:else if visibleStory.id === 'figma-1'}
                <h2 class="sticker sticker-lg figma-title">I made this site on Figma.</h2>
                <p class="sticker figma-sub">Implemented it with some more<br />tools (and AI).</p>
                <div class="tool-icon figma-logo">F</div>
                <div class="tool-icon github-logo">GH</div>
                <div class="thumb-row"><span></span><span></span><span></span></div>
                <div class="tool-icon triangle"></div>
                <div class="tool-icon ai-logo">✦</div>
                <p class="sticker sticker-lg check-link">Check it out <u>here</u></p>
              {:else if visibleStory.id === 'me-1'}
                <h2 class="sticker me-title">When I am not working, I am<br />exploring museums or exhibitions.</h2>
                <div class="museum-card museum-one"></div>
                <div class="museum-card museum-two"></div>
                <div class="museum-card museum-three"></div>
                <div class="museum-card museum-four"></div>
                <div class="museum-card museum-five"></div>
              {:else if visibleStory.id === 'me-2'}
                <div class="glass glass-one"></div>
                <div class="glass glass-two"></div>
                <div class="glass glass-three"></div>
                <p class="sticker glass-copy">Or making stuff with glass.</p>
                <div class="repair repair-one"></div>
                <div class="repair repair-two"></div>
                <div class="repair repair-three"></div>
                <p class="sticker repair-copy">Or just making or repairing something.</p>
              {:else if visibleStory.id === 'contact-1'}
                <div class="photo-figure desk-photo"></div>
                <h2 class="sticker sticker-lg contact-title">If you have reached<br />here, don’t forget to<br />say hello!</h2>
                <a class="sticker contact-link linkedin" href="https://www.linkedin.com" target="_blank" rel="noreferrer">LinkedIn</a>
                <a class="sticker contact-link instagram" href={instagramUrl} target="_blank" rel="noreferrer">@asheshgohil</a>
              {/if}
            </article>
          </div>
        {/each}
      </div>

      <span class="tap-zone tap-left" aria-hidden="true"></span>
      <span class="tap-zone tap-right" aria-hidden="true"></span>
    </div>
  </section>
</main>
