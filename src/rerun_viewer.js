import { WebViewer } from "@rerun-io/web-viewer";

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function startRerunViewerWithLoop(divId, rrdPath, timeline = "frame") {
  const viewer = new WebViewer();
  const parent = document.getElementById(divId);

  const rrdUrl = new URL(rrdPath, window.location.href).href;

  await viewer.start(rrdUrl, parent, {
    width: "100%",
    height: "520px",
    hide_welcome_screen: true,
  });

  // Wait for recording to load.
  let recordingId = null;
  let range = null;

  for (let i = 0; i < 100; i++) {
    recordingId = viewer.get_active_recording_id();

    if (recordingId !== null) {
      viewer.set_active_timeline(recordingId, timeline);
      range = viewer.get_time_range(recordingId, timeline);

      if (range !== null) {
        break;
      }
    }

    await sleep(100);
  }

  if (recordingId !== null && range !== null) {
    viewer.set_current_time(recordingId, timeline, range.min);
    viewer.set_playing(recordingId, true);

    viewer.on("time_update", () => {
      const t = viewer.get_current_time(recordingId, timeline);
      const r = viewer.get_time_range(recordingId, timeline);

      if (r !== null && t >= r.max) {
        viewer.set_current_time(recordingId, timeline, r.min);
        viewer.set_playing(recordingId, true);
      }
    });
  }

  return viewer;
}

await startRerunViewerWithLoop(
  "rerun-viewer-1",
  "data/scissors_redesigned.rrd",
  "frame"
);

await startRerunViewerWithLoop(
  "rerun-viewer-2",
  "data/syringe_redesigned.rrd",
  "frame"
);