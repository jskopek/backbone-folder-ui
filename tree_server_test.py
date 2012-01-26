import unittest
from tree_server import *

class TreeSetup(unittest.TestCase):
    def setUp(self):
        self.cd = CourseData()
        self.tree = self.cd.initialize_tree()
    def tearDown(self):
        self.cd = None
        self.tree = None
        
class TestTree(TreeSetup):
    def test_init(self):
        self.assertEqual(self.cd.folder_structure, "[{'title':'', 'children':[]}]")

class TestFolder(TreeSetup):
    def test_initialize_item(self):
        item = self.tree.initialize_type("folder")
        self.assertIsInstance(item, Folder)

        item = self.tree.initialize_type("item")
        self.assertIsInstance(item, Item)

    def test_initialize_item_title(self):
        item = self.tree.initialize_type("item", "Item 1")
        self.assertEqual(item.id, "Item 1")

        item = self.tree.initialize_type("folder", "Folder 1")
        self.assertEqual(item.id, "Folder 1")

    def test_add_item(self):
        self.assertFalse( len(self.tree.children) )

        item = self.tree.initialize_type("folder", "Folder 1")
        self.tree.add_item(item)        
        
        self.assertEqual( len(self.tree.children), 1 )
        self.assertEqual( self.tree.children[0].id, "Folder 1")

    def test_add_item_at_position(self):
        item = self.tree.initialize_type("folder", "Folder 1")
        self.tree.add_item(item)
        item = self.tree.initialize_type("item", "Item 1")
        self.tree.add_item(item)
        item = self.tree.initialize_type("item", "Item 2")
        self.tree.add_item(item, at=1)
        
        self.assertEqual( len(self.tree.children), 3 )
        self.assertEqual( self.tree.children[1].id, "Item 2")


    def test_add_folder(self):
        pass

#class TestMajorMethods(self):
    #def test_new_item(self):
        #add_item( self.cd, "folder", "Folder 1")
        #self.assertEqual( self, 

if __name__ == "__main__":
    unittest.main()