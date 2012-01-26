import unittest
from tree_server import *

class TestTree(unittest.TestCase):
    def setUp(self):
        self.cd = CourseData()
        self.tree = self.cd.initialize_tree()

    def test_init(self):
        self.cd.save_tree( self.tree )
        self.assertEqual(self.cd.folder_structure, "[{'title':'', 'children':[]}]")

if __name__ == "__main__":
    unittest.main()
