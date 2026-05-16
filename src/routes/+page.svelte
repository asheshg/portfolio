<script>
  import { onMount } from 'svelte';

  const storyDuration = 6000;
  const instagramUrl = 'https://www.instagram.com/asheshgohil';

  const chapters = [
    {
      label: 'Introduction',
      stories: [
        { src: '/stories/intro-1.png', width: 375, height: 758, alt: 'Introduction story 1' },
        { src: '/stories/intro-2.png', width: 375, height: 758, alt: 'Introduction story 2' },
        { src: '/stories/intro-3.png', width: 375, height: 758, alt: 'Introduction story 3' }
      ]
    },
    {
      label: 'Work - v0',
      stories: [
        { src: '/stories/work-v0-1.png', width: 375, height: 758, alt: 'Work v0 story 1' },
        { src: '/stories/work-v0-2.png', width: 375, height: 758, alt: 'Work v0 story 2' },
        { src: '/stories/work-v0-3.png', width: 375, height: 758, alt: 'Work v0 story 3' },
        { src: '/stories/work-v0-4.png', width: 375, height: 758, alt: 'Work v0 story 4' }
      ]
    },
    {
      label: 'Figma',
      stories: [{ src: '/stories/figma-1.png', width: 480, height: 758, alt: 'Figma story' }]
    },
    {
      label: 'Me',
      stories: [
        { src: '/stories/me-1.png', width: 375, height: 758, alt: 'Me story 1' },
        { src: '/stories/me-2.png', width: 375, height: 758, alt: 'Me story 2' }
      ]
    },
    {
      label: 'Contact',
      stories: [{ src: '/stories/contact-1.png', width: 375, height: 758, alt: 'Contact story' }]
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
  let progressKey = 0;
  let autoplayTimer;
  let mounted = false;
  let activeStories = chapters.map(() => 0);

  $: chapter = chapters[chapterIndex];
  $: story = chapter.stories[storyIndex];
  $: aspect = `${story.width} / ${story.height}`;
  $: progressStyle = `--story-duration:${storyDuration}ms;`;
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
    progressKey += 1;
    activeStories[safeChapter] = safeStory;
    activeStories = [...activeStories];
    window.history.replaceState(null, '', `#/${chapterIndex}/${storyIndex}`);
    if (mounted) scheduleAutoplay();
  }

  function nextStory() {
    if (storyIndex < chapter.stories.length - 1) {
      setStory(chapterIndex, storyIndex + 1, 1);
    }
  }

  function previousStory() {
    if (storyIndex > 0) {
      setStory(chapterIndex, storyIndex - 1, -1);
    }
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
    autoplayTimer = setTimeout(() => {
      autoplayNext();
    }, storyDuration);
  }

  function syncFromHash() {
    const [, rawChapter, rawStory] = window.location.hash.match(/^#\/(\d+)\/(\d+)$/) || [];
    if (rawChapter !== undefined && rawStory !== undefined) {
      const previousChapter = chapterIndex;
      const [safeChapter, safeStory] = clampStory(Number(rawChapter), Number(rawStory));
      chapterIndex = safeChapter;
      storyIndex = safeStory;
      direction = safeChapter >= previousChapter ? 1 : -1;
      progressKey += 1;
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

  <section
    class="story-stage"
    aria-label={`${chapter.label} story ${storyIndex + 1}`}
  >
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
            <img
              class="story-image"
              src={visibleStory.src}
              width={visibleStory.width}
              height={visibleStory.height}
              alt={visibleStory.alt}
            />

            <a
              class="profile-link"
              href={instagramUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Open Ashesh Gohil on Instagram"
              on:pointerdown|stopPropagation
              on:pointerup|stopPropagation
            ></a>

            <div class="progress-mask" aria-hidden="true">
              {#key `${progressKey}-${visibleChapter.index}`}
                <div class="progress-row" style={progressStyle}>
                  {#each chapters[visibleChapter.index].stories as item, index}
                    <span
                      class:complete={index < chapterStoryIndex(visibleChapter.index)}
                      class:current={visibleChapter.position === 'current' && index === storyIndex}
                    ></span>
                  {/each}
                </div>
              {/key}
            </div>
          </div>
        {/each}
      </div>

      <span class="tap-zone tap-left" aria-hidden="true"></span>
      <span class="tap-zone tap-right" aria-hidden="true"></span>
    </div>
  </section>
</main>
