<script>
  import { onMount } from 'svelte';

  const storyDuration = 6000;

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
  let progressKey = 0;
  let transitionKey = 0;
  let transitionKind = 'story';
  let autoplayTimer;
  let mounted = false;

  $: chapter = chapters[chapterIndex];
  $: story = chapter.stories[storyIndex];
  $: storyKey = `${chapterIndex}-${storyIndex}-${transitionKey}`;
  $: aspect = `${story.width} / ${story.height}`;
  $: progressStyle = `--story-duration:${storyDuration}ms;`;

  function clampStory(nextChapter, nextStory) {
    const safeChapter = Math.max(0, Math.min(chapters.length - 1, nextChapter));
    const safeStory = Math.max(0, Math.min(chapters[safeChapter].stories.length - 1, nextStory));
    return [safeChapter, safeStory];
  }

  function setStory(nextChapter, nextStory, nextDirection = 1) {
    const previousChapter = chapterIndex;
    const [safeChapter, safeStory] = clampStory(nextChapter, nextStory);
    const changedSection = previousChapter !== safeChapter;

    chapterIndex = safeChapter;
    storyIndex = safeStory;
    direction = nextDirection;
    transitionKind = changedSection ? 'section' : 'story';
    transitionKey += 1;
    progressKey += 1;
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
      setStory(chapterIndex + 1, 0, 1);
    }
  }

  function previousSection() {
    if (chapterIndex > 0) {
      setStory(chapterIndex - 1, 0, -1);
    }
  }

  function goToChapter(index) {
    setStory(index, 0, index >= chapterIndex ? 1 : -1);
  }

  function scheduleAutoplay() {
    clearTimeout(autoplayTimer);
    autoplayTimer = setTimeout(() => {
      nextStory();
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
      transitionKind = previousChapter !== safeChapter ? 'section' : 'story';
      transitionKey += 1;
      progressKey += 1;
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
    pointerStartX = event.clientX;
    pointerStartY = event.clientY;
  }

  function handlePointerUp(event) {
    const deltaX = event.clientX - pointerStartX;
    const deltaY = event.clientY - pointerStartY;

    if (Math.abs(deltaX) > 56 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) nextSection();
      if (deltaX > 0) previousSection();
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const midpoint = bounds.left + bounds.width / 2;
    if (event.clientX < midpoint) previousStory();
    else nextStory();
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
      role="group"
      aria-label="Story viewer"
      style:aspect-ratio={aspect}
      on:pointerdown={handlePointerDown}
      on:pointerup={handlePointerUp}
    >
      {#key storyKey}
        <img
          class="story-image"
          class:section-image={transitionKind === 'section'}
          src={story.src}
          width={story.width}
          height={story.height}
          alt={story.alt}
        />
      {/key}

      <div class="progress-mask" aria-hidden="true">
        {#key progressKey}
          <div class="progress-row" style={progressStyle}>
            {#each chapter.stories as item, index}
              <span class:complete={index < storyIndex} class:current={index === storyIndex}></span>
            {/each}
          </div>
        {/key}
      </div>

      <span class="tap-zone tap-left" aria-hidden="true"></span>
      <span class="tap-zone tap-right" aria-hidden="true"></span>
    </div>
  </section>
</main>
