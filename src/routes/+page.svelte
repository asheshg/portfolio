<script>
  import { onMount } from 'svelte';

  const chapters = [
    {
      label: 'Introduction',
      slides: [
        {
          eyebrow: 'Introduction',
          title: 'Ashesh Gohil',
          body: 'A portfolio told like a sequence of small, deliberate moments.',
          figure: '01 / opening frame',
          mode: 'intro',
          tags: ['Design', 'Motion', 'Code']
        },
        {
          eyebrow: 'Introduction',
          title: 'I design interfaces that move with intent.',
          body: 'The site behaves like stories: tap right to continue, tap left to rewind, swipe to move between chapters.',
          figure: '02 / interaction cue',
          mode: 'gesture',
          tags: ['Tap', 'Swipe', 'Keyboard']
        }
      ]
    },
    {
      label: 'Work - v0',
      slides: [
        {
          eyebrow: 'Work - v0',
          title: 'Fast prototypes, shaped into usable systems.',
          body: 'A space for experiments, launches, and product ideas that need taste and velocity at the same time.',
          figure: '03 / product board',
          mode: 'grid',
          tags: ['Prototype', 'Launch', 'System']
        },
        {
          eyebrow: 'Work - v0',
          title: 'From loose prompt to working interface.',
          body: 'Each motion decision is treated as part of the product language, not a decorative afterthought.',
          figure: '04 / iteration path',
          mode: 'timeline',
          tags: ['v0', 'UI', 'Flow']
        }
      ]
    },
    {
      label: 'Figma',
      slides: [
        {
          eyebrow: 'Figma',
          title: 'Design files become interaction maps.',
          body: 'Components, tokens, and transitions are translated into a living browser experience.',
          figure: '05 / canvas',
          mode: 'figma',
          tags: ['Components', 'Tokens', 'States']
        },
        {
          eyebrow: 'Figma',
          title: 'The file sets the structure. The website supplies the feel.',
          body: 'This version keeps the sections from the Penpot flow and recreates the story mechanic in code.',
          figure: '06 / handoff',
          mode: 'handoff',
          tags: ['Penpot', 'SvelteKit', 'Vercel']
        }
      ]
    },
    {
      label: 'Me',
      slides: [
        {
          eyebrow: 'Me',
          title: 'Designer, builder, and motion-minded collaborator.',
          body: 'Focused on portfolio systems, expressive interfaces, and the small details that make digital work feel handled.',
          figure: '07 / portrait placeholder',
          mode: 'me',
          tags: ['Product', 'Brand', 'Front-end']
        },
        {
          eyebrow: 'Me',
          title: 'Calm structure. Sharp interaction. A little rhythm.',
          body: 'The work is presented as a sequence because a portfolio should reveal itself, not unload everything at once.',
          figure: '08 / rhythm',
          mode: 'rhythm',
          tags: ['Editorial', 'Story', 'Motion']
        }
      ]
    },
    {
      label: 'Contact',
      slides: [
        {
          eyebrow: 'Contact',
          title: 'Let’s build something precise.',
          body: 'For projects, collaborations, or a sharper version of this site once the final assets are ready.',
          figure: '09 / closing card',
          mode: 'contact',
          tags: ['Email', 'Portfolio', 'Available']
        }
      ]
    }
  ];

  let chapterIndex = 0;
  let slideIndex = 0;
  let direction = 1;
  let touchStartX = 0;
  let touchStartY = 0;

  $: chapter = chapters[chapterIndex];
  $: slide = chapter.slides[slideIndex];
  $: storyKey = `${chapterIndex}-${slideIndex}`;

  function clampStory(nextChapter, nextSlide) {
    const safeChapter = Math.max(0, Math.min(chapters.length - 1, nextChapter));
    const safeSlide = Math.max(0, Math.min(chapters[safeChapter].slides.length - 1, nextSlide));
    return [safeChapter, safeSlide];
  }

  function setStory(nextChapter, nextSlide, nextDirection = 1) {
    [chapterIndex, slideIndex] = clampStory(nextChapter, nextSlide);
    direction = nextDirection;
    window.history.replaceState(null, '', `#/${chapterIndex}/${slideIndex}`);
  }

  function nextSlide() {
    if (slideIndex < chapter.slides.length - 1) {
      setStory(chapterIndex, slideIndex + 1, 1);
      return;
    }

    if (chapterIndex < chapters.length - 1) {
      setStory(chapterIndex + 1, 0, 1);
    }
  }

  function previousSlide() {
    if (slideIndex > 0) {
      setStory(chapterIndex, slideIndex - 1, -1);
      return;
    }

    if (chapterIndex > 0) {
      const previousChapter = chapters[chapterIndex - 1];
      setStory(chapterIndex - 1, previousChapter.slides.length - 1, -1);
    }
  }

  function goToChapter(index) {
    setStory(index, 0, index >= chapterIndex ? 1 : -1);
  }

  function handleKeydown(event) {
    if (event.key === 'ArrowRight' || event.key === ' ') nextSlide();
    if (event.key === 'ArrowLeft') previousSlide();
    if (event.key === 'ArrowUp') goToChapter(Math.max(0, chapterIndex - 1));
    if (event.key === 'ArrowDown') goToChapter(Math.min(chapters.length - 1, chapterIndex + 1));
  }

  function handleTouchStart(event) {
    const touch = event.touches[0];
    touchStartX = touch.clientX;
    touchStartY = touch.clientY;
  }

  function handleTouchEnd(event) {
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX;
    const deltaY = touch.clientY - touchStartY;

    if (Math.abs(deltaX) > 56 && Math.abs(deltaX) > Math.abs(deltaY)) {
      if (deltaX < 0) goToChapter(Math.min(chapters.length - 1, chapterIndex + 1));
      if (deltaX > 0) goToChapter(Math.max(0, chapterIndex - 1));
    }
  }

  onMount(() => {
    const [, rawChapter, rawSlide] = window.location.hash.match(/^#\/(\d+)\/(\d+)$/) || [];
    if (rawChapter !== undefined && rawSlide !== undefined) {
      [chapterIndex, slideIndex] = clampStory(Number(rawChapter), Number(rawSlide));
    } else {
      window.history.replaceState(null, '', '#/0/0');
    }

    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
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
    aria-label={`${chapter.label}: ${slide.title}`}
    on:touchstart={handleTouchStart}
    on:touchend={handleTouchEnd}
  >
    <div class="story-phone">
      <div class="progress-row" aria-hidden="true">
        {#each chapter.slides as item, index}
          <span class:complete={index < slideIndex} class:current={index === slideIndex}></span>
        {/each}
      </div>

      {#key storyKey}
        <article class={`story-card ${slide.mode}`}>
          <div class="visual-field" aria-hidden="true">
            <span class="shape shape-a"></span>
            <span class="shape shape-b"></span>
            <span class="shape shape-c"></span>
            <span class="artifact artifact-one"></span>
            <span class="artifact artifact-two"></span>
            <span class="artifact artifact-three"></span>
          </div>

          <div class="story-copy">
            <p class="eyebrow">{slide.eyebrow}</p>
            <h1>{slide.title}</h1>
            <p class="body">{slide.body}</p>
          </div>

          <div class="tag-row" aria-label="Topics">
            {#each slide.tags as tag}
              <span>{tag}</span>
            {/each}
          </div>

          <p class="figure">{slide.figure}</p>
        </article>
      {/key}

      <button class="tap-zone tap-left" type="button" aria-label="Previous story" on:click={previousSlide}></button>
      <button class="tap-zone tap-right" type="button" aria-label="Next story" on:click={nextSlide}></button>
    </div>
  </section>

  <aside class="site-note">
    <p>Tap left or right. Swipe sideways to skip sections.</p>
    <p>Arrow keys work too.</p>
  </aside>
</main>
