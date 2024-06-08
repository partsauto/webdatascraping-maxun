/**
 * RESTful API endpoints handling currently generated workflow management.
 */

import { Router } from 'express';
import logger from "../logger";
import { browserPool } from "../server";
import { readFile } from "../workflow-management/storage";

export const router = Router();

/**
 * Logs information about workflow API.
 */
router.all('/', (req, res, next) => {
  logger.log('debug',`The workflow API was invoked: ${req.url}`)
  next() // pass control to the next handler
})

/**
 * GET endpoint for a recording linked to a remote browser instance.
 * returns session's id
 */
router.get('/:browserId', (req, res) => {
  const activeBrowser = browserPool.getRemoteBrowser(req.params.browserId);
  let workflowFile = null;
  if (activeBrowser && activeBrowser.generator) {
    workflowFile = activeBrowser.generator.getWorkflowFile();
  }
  return res.send(workflowFile);
});

/**
 * Get endpoint returning the parameter array of the recording associated with the browserId browser instance.
 */
router.get('/params/:browserId', (req, res) => {
  const activeBrowser = browserPool.getRemoteBrowser(req.params.browserId);
  let params = null;
  if (activeBrowser && activeBrowser.generator) {
    params = activeBrowser.generator.getParams();
  }
  return res.send(params);
});

/**
 * DELETE endpoint for deleting a pair from the generated workflow.
 */
router.delete('/pair/:index', (req, res) => {
  const id = browserPool.getActiveBrowserId();
  if (id) {
    const browser = browserPool.getRemoteBrowser(id);
    if (browser) {
      browser.generator?.removePairFromWorkflow(parseInt(req.params.index));
      const workflowFile = browser.generator?.getWorkflowFile();
      return res.send(workflowFile);
    }
  }
  return res.send(null);
});

/**
 * POST endpoint for adding a pair to the generated workflow.
 */
router.post('/pair/:index', (req, res) => {
  const id = browserPool.getActiveBrowserId();
  if (id) {
    const browser = browserPool.getRemoteBrowser(id);
    logger.log('debug', `Adding pair to workflow`);
    if (browser) {
      logger.log('debug', `Adding pair to workflow: ${JSON.stringify(req.body)}`);
      if (req.body.pair) {
        browser.generator?.addPairToWorkflow(parseInt(req.params.index), req.body.pair);
        const workflowFile = browser.generator?.getWorkflowFile();
        return res.send(workflowFile);
      }
    }
  }
  return res.send(null);
});

