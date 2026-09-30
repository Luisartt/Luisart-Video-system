# Finished Posts

One page per finished post (carousel, reel, story, video), created when the creator says "it is done".
Suggested frontmatter: `type: video`, `format`, `caption`, `files` (full paths, never copies of the videos),
`buffer_post_id`, `scheduled_for`, `status` (`scheduled` / `published` / `draft`), `updated`.
The AI fills the Buffer id, date and time after scheduling (skill `buffer-publishing-setup`) and adds a `Log.md` line.
